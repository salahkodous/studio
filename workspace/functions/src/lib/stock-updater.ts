
/**
 * @fileOverview Core logic for fetching, translating, and storing stock data.
 */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {assets as staticAssets} from "./static-data";
import {logError} from "./error-logger";
import * as fs from "fs";
import * as path from "path";
import {ai} from "./genkit-config";
import {z} from "zod";

// Initialize Firebase Admin SDK if not already done.
// The SDK is automatically configured by the Firebase Functions environment.
if (!(global as any)._firebaseApp) {
    (global as any)._firebaseApp = initializeApp();
}
const db = getFirestore();

// Define Zod schemas for the AI extraction prompt
const ExtractedStockSchema = z.object({
    companyName: z.string().describe("The full name of the company in Arabic, exactly as it appears in the text."),
    lastPrice: z.string().describe("The last transaction price, as a string."),
});

const PriceExtractionOutputSchema = z.object({
    stocks: z.array(ExtractedStockSchema),
});


/**
 * Reads and extracts the raw markdown content from the local JSON file.
 * @returns A promise that resolves to the markdown string or null.
 */
async function getMarkdownFromLocalFile(): Promise<string | null> {
    const filePath = path.join(__dirname, "../../../prices/12-7.json");
    console.log(`[LocalFile] Reading raw data from: ${filePath}`);
    
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }
        const fileContent = fs.readFileSync(filePath, "utf8");
        const rawData = JSON.parse(fileContent);

        // The provided JSON is an array with one object containing the markdown
        if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].markdown) {
            console.log(`[LocalFile] Successfully extracted markdown content.`);
            return rawData[0].markdown;
        }

        throw new Error("Invalid data structure in JSON file. Expected an array with an object containing a 'markdown' property.");
        
    } catch (error) {
        await logError(`getMarkdownFromLocalFile`, error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}


/**
 * Uses an AI prompt to extract structured stock data from raw markdown text.
 * @param markdown The raw markdown content from the scraped page.
 * @returns A promise that resolves to the structured stock data.
 */
const priceExtractionPrompt = ai.definePrompt({
    name: "priceExtractionPrompt",
    input: {schema: z.string()},
    output: {schema: PriceExtractionOutputSchema},
    prompt: `You are a data extraction expert. Your task is to extract stock information from the provided markdown text, which comes from the Saudi Exchange website.

    Focus on the main table that lists companies. For each row in that table, extract the following:
    1. The full "Company Name" (in Arabic).
    2. The "Previous Close" price.

    Return the data as a JSON object that adheres to the output schema. Ignore everything else in the text.

    Markdown Content:
    ---
    {{{input}}}
    ---
    `,
});


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

    console.log("[Updater] Asking AI to extract structured data from markdown...");
    const {output} = await priceExtractionPrompt(markdownContent);
    
    if (!output || !output.stocks || output.stocks.length === 0) {
        console.error("Aborting update, AI failed to extract any stock data.");
        throw new Error("AI extraction failed to return any stocks.");
    }
    
    console.log(`[Updater] AI successfully extracted ${output.stocks.length} stock entries.`);

    const batch = db.batch();
    let successCount = 0;
    
    for (const extractedStock of output.stocks) {
        // Find the corresponding asset from our master list by Arabic name
        const asset = staticAssets.find(a => a.name_ar === extractedStock.companyName.trim());
        const price = parseFloat(extractedStock.lastPrice.replace(/,/g, ''));
        
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
        } else {
            console.warn(`[Updater] Could not match or parse: Company: ${extractedStock.companyName}, Price: ${extractedStock.lastPrice}`);
        }
    }

    if (successCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${successCount} stock prices in Firestore.`);
    } else {
      console.warn("No stock prices were updated in this run.");
    }
}
