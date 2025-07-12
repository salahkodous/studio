
/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK if not already done.
// The SDK is automatically configured by the Firebase Functions environment.
if (!global._firebaseApp) {
    global._firebaseApp = initializeApp();
}
const db = getFirestore();

declare global {
  // eslint-disable-next-line no-var
  var _firebaseApp: any;
}


interface ExtractedStock {
    company: string;
    last_price: string;
}


/**
 * Reads stock prices from a local JSON file.
 * @returns A promise that resolves to an array of extracted stock data.
 */
async function getPricesFromLocalFile(): Promise<ExtractedStock[] | null> {
    // The path is relative to the location of the compiled JS file in the 'lib' directory
    const filePath = path.join(__dirname, '../../../prices/12-7.json');
    console.log(`[LocalFile] Reading price data from: ${filePath}`);
    
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data: ExtractedStock[] = JSON.parse(fileContent);

        if (!Array.isArray(data)) {
             throw new Error("Invalid data structure received from JSON file. Expected an array.");
        }

        console.log(`[LocalFile] Successfully extracted ${data.length} stock entries.`);
        return data;
        
    } catch (error) {
        await logError(`getPricesFromLocalFile`, error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}


/**
 * The main orchestrator function. Gets all stock prices from the local JSON file
 * and saves the data to Firestore.
 */
export async function updateAllMarketPrices() {
    const extractedData = await getPricesFromLocalFile();

    if (!extractedData) {
        console.error("Aborting update, failed to read data from local file.");
        return;
    }

    const batch = db.batch();
    let successCount = 0;
    
    for (const extractedStock of extractedData) {
        // Find the corresponding asset from our master list by Arabic name
        const asset = staticAssets.find(a => a.name_ar === extractedStock.company.trim());
        const price = parseFloat(extractedStock.last_price.replace(/,/g, ''));
        
        if (asset && !isNaN(price)) {
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
            console.log(`[Updater] Staging update for ${asset.ticker} (${asset.name_ar}) with price ${price}`);
        } else {
            console.warn(`[Updater] Could not match or parse: Company: ${extractedStock.company}, Price: ${extractedStock.last_price}`);
        }
    }

    if (successCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${successCount} stock prices in Firestore from local JSON.`);
    } else {
      console.warn("No stock prices were updated in this run.");
    }
}
