
/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";
import * as fs from "fs";
import * as path from "path";

const db = getFirestore();

/**
 * Reads and extracts the raw markdown content from the local JSON file.
 * This function is now more robust in locating the file.
 * @returns A promise that resolves to the markdown string or null.
 */
async function getMarkdownFromLocalFile(): Promise<string | null> {
    // process.cwd() in Cloud Functions points to the root of the function's directory, which is /workspace/functions
    const filePath = path.resolve(process.cwd(), "../prices/12-7.json");
    console.log(`[LocalFile] Attempting to read raw data from absolute path: ${filePath}`);
    
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}. Make sure the 'prices' directory is at the root of the 'workspace' folder.`);
        }
        const fileContent = fs.readFileSync(filePath, "utf8");
        const rawData = JSON.parse(fileContent);

        if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].markdown) {
            console.log(`[LocalFile] Successfully extracted markdown content.`);
            return rawData[0].markdown;
        }

        throw new Error("Invalid data structure in JSON file. Expected an array with an object containing a 'markdown' property.");
        
    } catch (error) {
        await logError(`getMarkdownFromLocalFile-critical`, error instanceof Error ? error : new Error(String(error)));
        // Re-throw the error to ensure the calling function knows it failed.
        throw error;
    }
}


/**
 * The main orchestrator function. Gets all stock prices from the local JSON file
 * by using an AI prompt to parse the content and then saves the data to Firestore.
 */
export async function updateAllMarketPrices() {
    const markdownContent = await getMarkdownFromLocalFile();

    if (!markdownContent) {
        console.error("Aborting update, failed to read markdown data from local file.");
        return;
    }

    // Direct parsing of the markdown content instead of using AI
    const lines = markdownContent.split('\n');
    const stockDataRegex = /\| \d{4} \| \[([^\]]+)\]\(.+\) \| ([\d,.]+) \|/;

    const extractedStocks = [];
    for (const line of lines) {
        const match = line.match(stockDataRegex);
        if (match) {
            const companyName = match[1].trim();
            const lastPrice = match[2].trim();
            extractedStocks.push({ companyName, lastPrice });
        }
    }
    
    if (!extractedStocks || extractedStocks.length === 0) {
        console.error("Aborting update, failed to extract any stock data from markdown.");
        throw new Error("Markdown parsing failed to return any stocks.");
    }
    
    console.log(`[Updater] Successfully extracted ${extractedStocks.length} stock entries from markdown.`);

    const batch = db.batch();
    let successCount = 0;
    
    for (const extractedStock of extractedStocks) {
        // Find the corresponding asset from our master list by Arabic name OR by ticker-like name
        const asset = staticAssets.find(a => 
            a.name_ar.trim() === extractedStock.companyName.trim() ||
            a.ticker.trim().toUpperCase() === extractedStock.companyName.trim().toUpperCase() ||
            a.name.trim().toUpperCase() === extractedStock.companyName.trim().toUpperCase()
        );
        const price = parseFloat(extractedStock.lastPrice.replace(/,/g, ''));
        
        if (asset && !isNaN(price)) {
            const stockDocRef = db.collection("saudi stock prices").doc(asset.ticker);
            batch.set(stockDocRef, {
                ticker: asset.ticker,
                name_ar: asset.name_ar,
                name_en: asset.name,
                price: price,
                currency: asset.currency,
                lastUpdated: Timestamp.now(),
            }, { merge: true });
            successCount++;
        } else {
            console.warn(`[Updater] Could not match or parse: Company: "${extractedStock.companyName}", Price: "${extractedStock.lastPrice}"`);
        }
    }

    if (successCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${successCount} stock prices in Firestore.`);
    } else {
      console.warn("No stock prices were updated in this run.");
    }
}
