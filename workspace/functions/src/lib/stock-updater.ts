
/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {ai} from "./genkit-config";
import {z} from "zod";
import {webScraperTool} from "./web-scraper-tool";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";

// Initialize Firebase Admin SDK.
// The SDK is automatically configured by the Firebase Functions environment.
initializeApp();
const db = getFirestore();

interface StockAsset {
    ticker: string;
    name: string;
    currency: string;
}

const priceExtractionPrompt = ai.definePrompt({
    name: "priceExtractionPrompt",
    model: "googleai/gemini-1.5-flash",
    input: {schema: z.object({ context: z.string(), companyName: z.string() })},
    output: {schema: z.object({ price: z.number() })},
    prompt: `From the following financial data page content for {{{companyName}}}, extract the current stock price. The price is usually a large number near the company name or ticker symbol. Respond with only a JSON object containing the numeric price.

    Scraped Content:
    {{{context}}}`,
});

/**
 * Scrapes a financial page for a stock and extracts its price using AI.
 * @param asset The stock asset (ticker, name, currency).
 * @returns A promise that resolves to the numeric price or null if not found.
 */
async function getPriceByScraping(asset: StockAsset): Promise<number | null> {
    const url = `https://www.google.com/finance/quote/${asset.ticker}:${asset.currency === 'SAR' ? 'TADAWUL' : (asset.currency === 'AED' ? 'DFM' : 'QSE')}`;

    try {
        console.log(`[Scraper] Scraping URL for ${asset.ticker}: ${url}`);
        const scrapeResult = await webScraperTool({ url });

        if (!scrapeResult?.content) {
            throw new Error("Scraped content was empty.");
        }
        
        console.log(`[Scraper] Extracting price for ${asset.ticker} with Genkit...`);
        const { output } = await priceExtractionPrompt({
            context: scrapeResult.content,
            companyName: asset.name,
        });

        if (output?.price && typeof output.price === 'number') {
            return output.price;
        }
        
        console.warn(`[Scraper] AI could not extract a valid price for ${asset.ticker}.`);
        return null;

    } catch (error) {
        await logError(`getPriceByScraping-${asset.ticker}`, error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}


/**
 * The main orchestrator function. Gets all trackable stocks from the static data,
 * scrapes their current price, and saves the data to Firestore.
 */
export async function updateAllMarketPrices() {
  const stocksToTrack = staticAssets.filter(a => a.category === 'Stocks');
  console.log(`Starting stock update for ${stocksToTrack.length} assets.`);
  
  const batch = db.batch();
  let successCount = 0;

  for (const asset of stocksToTrack) {
    const price = await getPriceByScraping(asset);
    
    if (price !== null) {
        const stockDocRef = db.collection("stocks").doc(asset.ticker);
        batch.set(stockDocRef, {
            ticker: asset.ticker,
            name_ar: asset.name_ar,
            name_en: asset.name,
            price: price,
            currency: asset.currency,
            lastUpdated: Timestamp.now(),
        }, { merge: true });
        successCount++;
        console.log(`[Updater] Successfully processed ${asset.ticker} with price ${price}`);
    } else {
        console.warn(`[Updater] Skipping ${asset.ticker} due to scraping/extraction failure.`);
    }
  }

  if (successCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${successCount} of ${stocksToTrack.length} stock prices in Firestore.`);
  } else {
      console.warn("No stock prices were updated in this run.");
  }
}
