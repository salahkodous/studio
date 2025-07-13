/**
 * @fileOverview Core logic for fetching and storing stock data using Firecrawl.
 */
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {logError} from "./error-logger";
import FirecrawlApp from "@mendable/firecrawl-js";

const db = getFirestore();

interface ScrapedStock {
  name: string;
  ticker: string;
  price: string;
}

/**
 * Scrapes the Saudi Exchange website for the latest stock prices using Firecrawl's
 * structured extraction feature.
 * @returns A promise that resolves to an array of scraped stock objects.
 */
async function scrapeStockData(): Promise<ScrapedStock[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey.length < 5) {
    const errorMsg = "Firecrawl API key not configured. Please add it to functions/.env";
    console.error(`[Firecrawl] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const firecrawl = new FirecrawlApp({apiKey});
  const url = "https://www.saudiexchange.sa/wps/portal/saudiexchange/ourmarkets/main-market-watch/theoritical-market-watch-today?locale=en";

  console.log(`[Scraper] Starting structured scrape for URL: ${url}`);

  try {
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
    });

    // @ts-ignore
    const data = scrapeResult.data as ScrapedStock[];

    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`[Scraper] Successfully extracted ${data.length} stock entries.`);
      return data.filter(s => s.ticker && s.price); // Filter out any incomplete entries
    } else {
      console.error("[Scraper] Firecrawl returned no data or data in an unexpected format.", scrapeResult);
      throw new Error("Firecrawl returned no data or it was in an unexpected format.");
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logError("scrapeStockData-critical", err);
    throw err;
  }
}

/**
 * The main orchestrator function. Scrapes live stock prices and saves them to Firestore.
 */
export async function updateAllMarketPrices() {
  const extractedStocks = await scrapeStockData();

  if (!extractedStocks || extractedStocks.length === 0) {
    console.error("Aborting update, failed to scrape any stock data.");
    return;
  }

  const collectionName = "saudi_stocks";
  console.log(`[Updater] Preparing to write ${extractedStocks.length} documents to the '${collectionName}' collection.`);
  
  const batch = db.batch();
  let successCount = 0;

  for (const stock of extractedStocks) {
    const price = parseFloat(stock.price.replace(/,/g, ""));

    if (stock.ticker && !isNaN(price)) {
      const stockDocRef = db.collection(collectionName).doc(stock.ticker);
      batch.set(stockDocRef, {
        name_en: stock.name,
        ticker: stock.ticker,
        price: price,
        currency: "SAR", // Assuming SAR for all stocks from this source
        lastUpdated: Timestamp.now(),
      });
      successCount++;
    } else {
      console.warn(`[Updater] Skipping invalid entry: Name: "${stock.name}", Ticker: "${stock.ticker}", Price: "${stock.price}"`);
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(`[Updater] Successfully wrote ${successCount} stock prices to Firestore.`);
  } else {
    console.warn("[Updater] No valid stock data was written in this run.");
  }
}
