
/**
 * @fileOverview Core logic for fetching and storing stock data using Firecrawl.
 */
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import FirecrawlApp from "@mendable/firecrawl-js";
import { assets as staticAssets } from "./static-data";

const db = getFirestore();

interface ScrapedStock {
  name: string;
  ticker: string;
  price: string;
}

/**
 * The main orchestrator function. Scrapes live stock prices and saves them to Firestore.
 */
export async function updateAllMarketPrices() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey.length < 5) {
    const errorMsg = "Firecrawl API key not configured. Please add it to functions/.env";
    console.error(`[Firecrawl] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  const firecrawl = new FirecrawlApp({apiKey});
  const url = "https://www.saudiexchange.sa/wps/portal/saudiexchange/ourmarkets/main-market-watch/theoritical-market-watch-today?locale=en";

  console.log(`[Updater] Starting structured scrape for URL: ${url}`);
  
  const scrapeResult = await firecrawl.scrapeUrl(url, {
    extractorOptions: {
      mode: "llm-extraction",
      extractionSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {type: "string", description: "The full name of the company in English."},
            ticker: {type: "string", description: "The stock ticker symbol, which is a number."},
            price: {type: "string", description: "The previous closing price of the stock."},
          },
          required: ["name", "ticker", "price"],
        },
      },
      extractionPrompt: "Extract the stock information from the table. The company name is in the 'Company Name' column. The symbol is the ticker.",
    },
      pageOptions: {
        onlyMainContent: true
      }
  });

  const extractedStocks = (scrapeResult?.data ?? []) as ScrapedStock[];
  
  if (!extractedStocks || extractedStocks.length === 0) {
    console.warn("Aborting update, failed to scrape any stock data.");
    return;
  }
  
  const collectionName = "saudi_stocks";
  console.log(`[Updater] Preparing to write ${extractedStocks.length} documents to the '${collectionName}' collection.`);
  
  const batch = db.batch();
  let successCount = 0;

  for (const stock of extractedStocks) {
    const price = parseFloat(stock.price.replace(/,/g, ""));
    const ticker = stock.ticker.trim();

    if (ticker && !isNaN(price)) {
      const staticAsset = staticAssets.find(a => a.ticker === ticker);
      const stockDocRef = db.collection(collectionName).doc(ticker);
      
      batch.set(stockDocRef, {
        name_en: stock.name,
        name_ar: staticAsset ? staticAsset.name_ar : stock.name,
        ticker: ticker,
        price: price,
        currency: "SAR",
        lastUpdated: Timestamp.now(),
      });
      successCount++;
    } else {
      console.warn(`[Updater] Skipping invalid entry: Ticker: "${ticker}", Price: "${stock.price}"`);
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(`[Updater] Successfully wrote ${successCount} stock prices to Firestore.`);
  } else {
    console.warn("[Updater] No valid stock data was written in this run.");
  }
}
