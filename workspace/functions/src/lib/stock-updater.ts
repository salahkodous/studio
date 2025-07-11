/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {ai} from "./genkit-config";
import {z} from "zod";

// Initialize Firebase Admin SDK.
// The SDK is automatically configured by the Firebase Functions environment.
initializeApp();
const db = getFirestore();

interface StockAsset {
    ticker: string;
    name: string;
    currency: string;
}

interface StockPrice {
    price: string;
}

const MARKETS = ["SA", "AE", "QA"];

/**
 * Fetches the list of all stocks for a given market from the Twelve Data API.
 * @param market The market identifier (e.g., 'SA', 'AE', 'QA').
 * @returns A promise that resolves to an array of stock assets.
 */
async function fetchAssetsForMarket(market: string): Promise<StockAsset[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error("TWELVE_DATA_API_KEY is not configured.");

  const exchangeMap = {SA: "Tadawul", AE: "DFM", QA: "QSE"};
  const exchange = exchangeMap[market as keyof typeof exchangeMap];
  const url = `https://api.twelvedata.com/stocks?exchange=${exchange}&country=${market}&type=stock`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch assets for ${market}: ${response.statusText}`);
  }
  const result = await response.json();

  if (result?.data && Array.isArray(result.data)) {
    return result.data.map((asset: any) => ({
      ticker: asset.symbol,
      name: asset.name,
      currency: asset.currency,
    }));
  }
  return [];
}

/**
 * Fetches the current price for a single stock ticker.
 * @param ticker The stock ticker symbol.
 * @returns A promise that resolves to the stock's price information.
 */
async function fetchPriceForTicker(ticker: string): Promise<StockPrice | null> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error("TWELVE_DATA_API_KEY is not configured.");

  const url = `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`Could not fetch price for ${ticker}: ${response.statusText}`);
    return null;
  }
  return response.json();
}

/**
 * Translates an English company name to Arabic using the Gemini API.
 * @param companyName The English name of the company.
 * @returns A promise that resolves to the Arabic name.
 */
async function translateNameToArabic(companyName: string): Promise<string> {
  const arabicNamePrompt = ai.definePrompt({
    name: "arabicNamePrompt",
    input: {schema: z.string()},
    output: {schema: z.object({arabicName: z.string()})},
    prompt: `Translate the following official company name to Arabic. Provide only the translated name in the response.

    Company Name: "{{input}}"
    `,
  });

  try {
    const {output} = await arabicNamePrompt(companyName);
    return output?.arabicName || companyName;
  } catch (error) {
    console.error(`Gemini translation failed for "${companyName}":`, error);
    // Fallback to the original name if translation fails.
    return companyName;
  }
}

/**
 * Gets the Arabic name for a stock ticker.
 * It first checks the Firestore `/stock_map` collection for a cached name.
 * If not found, it uses Gemini to translate the name and then saves it to the map.
 * @param asset The stock asset containing the ticker and English name.
 * @returns A promise that resolves to the Arabic name.
 */
async function getArabicName(asset: StockAsset): Promise<string> {
  const mapRef = db.collection("stock_map").doc(asset.ticker);
  const mapDoc = await mapRef.get();

  if (mapDoc.exists && mapDoc.data()?.name_ar) {
    return mapDoc.data()?.name_ar;
  }

  console.log(`No mapping for ${asset.ticker}. Translating "${asset.name}" with Gemini.`);
  const arabicName = await translateNameToArabic(asset.name);

  // Cache the new translation in Firestore for future use.
  await mapRef.set({name_ar: arabicName, name_en: asset.name});

  return arabicName;
}

/**
 * The main orchestrator function. Fetches assets for all markets,
 * gets their prices and Arabic names, and saves the data to Firestore.
 */
export async function updateAllMarketPrices() {
  console.log("Starting stock update for markets:", MARKETS.join(", "));
  const allAssets: StockAsset[] = [];

  for (const market of MARKETS) {
    const assets = await fetchAssetsForMarket(market);
    allAssets.push(...assets);
    console.log(`Fetched ${assets.length} assets for market: ${market}`);
  }

  const batch = db.batch();

  for (const asset of allAssets) {
    const priceData = await fetchPriceForTicker(asset.ticker);
    if (!priceData?.price) {
      console.warn(`Skipping ${asset.ticker} due to missing price data.`);
      continue;
    }

    const arabicName = await getArabicName(asset);

    const stockDocRef = db.collection("stocks").doc(asset.ticker);
    batch.set(stockDocRef, {
      ticker: asset.ticker,
      name_ar: arabicName,
      price: parseFloat(priceData.price),
      currency: asset.currency,
      lastUpdated: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Successfully updated ${allAssets.length} stock prices in Firestore.`);
}
