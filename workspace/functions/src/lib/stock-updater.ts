/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";
import FirecrawlApp from "@mendable/firecrawl-js";

const db = getFirestore();

/**
 * Scrapes the Saudi Exchange website for the latest stock prices using Firecrawl's
 * structured extraction feature and returns a clean array of stock data.
 * @returns A promise that resolves to an array of scraped stock objects.
 */
async function scrapeStockData(): Promise<{ name: string; price: string; ticker: string; }[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey.length < 5) {
    const errorMsg = "Firecrawl API key not configured. Please add your FIRECRAWL_API_KEY to the functions/.env file.";
    console.error(`[Firecrawl] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const firecrawl = new FirecrawlApp({apiKey});
  const url = "https://www.saudiexchange.sa/wps/portal/saudiexchange/ourmarkets/main-market-watch/theoritical-market-watch-today?locale=en";

  console.log(`[Scraper] Starting scrape for URL: ${url}`);

  try {
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      extractorOptions: {
        mode: 'llm-extraction',
        extractionSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              companyName: {
                type: 'string',
                description: 'The full name of the company in Arabic.'
              },
              ticker: {
                type: 'string',
                description: 'The stock ticker symbol, which is a number.'
              },
              price: {
                type: 'string',
                description: 'The previous closing price of the stock.'
              }
            }
          }
        },
        extractionPrompt: 'Extract the stock information from the provided context. Make sure to only extract from the main market watch table.'
      }
    });

    if (scrapeResult.data && Array.isArray(scrapeResult.data) && scrapeResult.data.length > 0) {
      console.log(`[Scraper] Successfully extracted ${scrapeResult.data.length} stock entries.`);
      // @ts-ignore
      return scrapeResult.data;
    } else {
      throw new Error("Firecrawl returned no data or data in an unexpected format.");
    }
  } catch (error) {
    await logError('scrapeStockData-critical', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * The main orchestrator function. Scrapes live stock prices and saves them to Firestore.
 */
export async function updateAllMarketPrices() {
  const extractedStocks = await scrapeStockData();

  if (!extractedStocks || extractedStocks.length === 0) {
    console.error("Aborting update, failed to scrape any stock data.");
    throw new Error("Scraping failed to return any stocks.");
  }

  console.log(`[Updater] Preparing to update ${extractedStocks.length} stock entries in Firestore.`);

  const batch = db.batch();
  let successCount = 0;

  for (const extractedStock of extractedStocks) {
    // Find the corresponding asset from our master list by ticker symbol
    // This is more reliable than matching by name.
    const asset = staticAssets.find(a => a.ticker === extractedStock.ticker);
    const price = parseFloat(extractedStock.price.replace(/,/g, ''));

    if (asset && !isNaN(price)) {
      const stockDocRef = db.collection("saudi stock prices").doc(asset.ticker);
      batch.set(stockDocRef, {
        ticker: asset.ticker,
        name_ar: asset.name_ar,
        name_en: asset.name,
        price: price,
        currency: asset.currency,
        lastUpdated: Timestamp.now(),
      }, {merge: true});
      successCount++;
    } else {
      console.warn(`[Updater] Could not match or parse: Ticker: "${extractedStock.ticker}", Name: "${extractedStock.name}", Price: "${extractedStock.price}"`);
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(`[Updater] Successfully updated ${successCount} stock prices in Firestore.`);
  } else {
    console.warn("[Updater] No stock prices were updated in this run.");
  }
}
