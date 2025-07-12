
/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";
import fetch from 'node-fetch'; // Using node-fetch for direct API calls

// Initialize Firebase Admin SDK if not already done.
// The SDK is automatically configured by the Firebase Functions environment.
if (!global._firebaseApp) {
    global._firebaseApp = initializeApp();
}
const db = getFirestore();

declare global {
  var _firebaseApp: any;
}


interface ExtractedStock {
    symbol: string;
    name: string;
    previous_price: string;
}


/**
 * Fetches all stock prices from the Saudi Exchange market watch page using Firecrawl's extract feature.
 * @returns A promise that resolves to an array of extracted stock data.
 */
async function getPricesFromMarketWatch(): Promise<ExtractedStock[] | null> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.error("[Firecrawl] API key is missing.");
        throw new Error("Firecrawl API key not configured.");
    }
    
    const url = "https://api.firecrawl.dev/v1/extract";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    };
    
    const payload = {
        // Use the precise English URL provided by the user for end-of-day prices
        "url": "https://www.saudiexchange.sa/wps/portal/saudiexchange/ourmarkets/main-market-watch/theoritical-market-watch-today?locale=en",
        "extractorOptions": {
            "mode": "llm-extraction",
            // Update the schema to match the requested columns: symbol, name, previous_price
            "extractionSchema": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "symbol": { "type": "string" },
                        "name": { "type": "string" },
                        "previous_price": { "type": "string" }
                    }
                }
            },
            "extractionPrompt": "Extract all rows from the main market watch table. For each row, return 'symbol', 'name', and 'previous_price'."
        }
    };

    console.log("[MarketWatch] Sending extraction request to Firecrawl...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Firecrawl API request failed with status ${response.status}: ${errorBody}`);
        }
        
        const result = await response.json() as { data: { data: ExtractedStock[] } };

        if (!result.data || !result.data.data || !Array.isArray(result.data.data)) {
            console.error("Firecrawl response format is invalid:", result);
            throw new Error("Invalid data structure received from Firecrawl.");
        }
        
        console.log(`[MarketWatch] Successfully extracted ${result.data.data.length} stock entries.`);
        return result.data.data;
        
    } catch (error) {
        await logError(`getPricesFromMarketWatch`, error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}


/**
 * The main orchestrator function. Gets all stock prices from the market watch page
 * and saves the data to Firestore.
 */
export async function updateAllMarketPrices() {
    const extractedData = await getPricesFromMarketWatch();

    if (!extractedData) {
        console.error("Aborting update, failed to extract data from Firecrawl.");
        return;
    }

    const batch = db.batch();
    let successCount = 0;
    
    // No longer need to map by name, we can use the symbol directly.

    for (const extractedStock of extractedData) {
        // Use the extracted symbol directly, which is more reliable.
        const ticker = extractedStock.symbol.trim();
        const asset = staticAssets.find(a => a.ticker === ticker);
        const price = parseFloat(extractedStock.previous_price.replace(/,/g, ''));
        
        if (asset && !isNaN(price)) {
            const stockDocRef = db.collection("stocks").doc(ticker);
            batch.set(stockDocRef, {
                ticker: asset.ticker,
                name_ar: asset.name_ar,
                name_en: asset.name,
                price: price,
                currency: asset.currency,
                lastUpdated: Timestamp.now(),
            }, { merge: true });
            successCount++;
            console.log(`[Updater] Staging update for ${ticker} (${asset.name_ar}) with price ${price}`);
        } else {
            console.warn(`[Updater] Could not match or parse: Symbol: ${extractedStock.symbol}, Name: ${extractedStock.name}, Price: ${extractedStock.previous_price}`);
        }
    }

    if (successCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${successCount} stock prices in Firestore.`);
    } else {
      console.warn("No stock prices were updated in this run.");
    }
}
