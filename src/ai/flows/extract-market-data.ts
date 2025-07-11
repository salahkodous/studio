
'use server';
/**
 * @fileOverview A flow for extracting market data from a website.
 * - extractAndStoreMarketData: Scrapes a URL, extracts asset tickers and names, and stores them in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { webScraperTool } from '../tools/web-scraper-tool';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ExtractMarketDataInputSchema = z.object({
  marketUrl: z.string().url().describe('The URL of the official market data website to scrape.'),
  marketId: z.string().describe('A short identifier for the market (e.g., "TADAWUL").'),
});

const ExtractedAssetSchema = z.object({
    ticker: z.string().describe('The official stock ticker symbol.'),
    name: z.string().describe('The full official name of the company in English.'),
});

const ExtractionResultSchema = z.object({
    assets: z.array(ExtractedAssetSchema).describe('A list of all extracted assets.'),
});

export async function extractAndStoreMarketData(input: z.infer<typeof ExtractMarketDataInputSchema>) {
    return extractMarketDataFlow(input);
}

const extractorPrompt = ai.definePrompt({
    name: 'marketDataExtractorPrompt',
    input: { schema: z.object({ scrapedContent: z.string() }) },
    output: { schema: ExtractionResultSchema },
    model: 'googleai/gemini-pro',
    prompt: `You are an expert financial data analyst. Your task is to parse the provided HTML/Markdown content from a stock market website and extract all company names and their corresponding ticker symbols.

    - Identify every company listed on the page.
    - Extract its official ticker symbol.
    - Extract its full official English name.
    - Ignore any other information.
    - Return the data ONLY in the specified JSON format.

    Scraped Content:
    {{{scrapedContent}}}
    `,
});

const extractMarketDataFlow = ai.defineFlow(
  {
    name: 'extractMarketDataFlow',
    inputSchema: ExtractMarketDataInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        count: z.number(),
        marketId: z.string(),
    }),
  },
  async ({ marketUrl, marketId }) => {
    console.log(`[Flow] Starting data extraction for ${marketId} from ${marketUrl}`);

    // 1. Scrape the URL using Firecrawl via the webScraperTool
    const scrapeResult = await webScraperTool({ url: marketUrl });
    if (!scrapeResult || !scrapeResult.content) {
        throw new Error(`Failed to scrape the URL: ${marketUrl}`);
    }

    console.log(`[Flow] Scraped content received. Extracting assets with AI...`);

    // 2. Extract structured data using the AI prompt
    const { output } = await extractorPrompt({ scrapedContent: scrapeResult.content });

    if (!output || !output.assets || output.assets.length === 0) {
        console.error('[Flow] AI failed to extract any assets.');
        return { success: false, count: 0, marketId };
    }

    console.log(`[Flow] Extracted ${output.assets.length} assets. Storing to Firestore...`);

    // 3. Store the extracted data in Firestore
    const assetsCollectionRef = doc(db, 'market_assets', marketId);
    
    // We will store the array of assets in a single document named after the market.
    // This is efficient for fetching all assets for a market at once.
    await setDoc(assetsCollectionRef, {
        assets: output.assets,
        updatedAt: new Date(),
        sourceUrl: marketUrl,
    });
    
    console.log(`[Flow] Successfully stored ${output.assets.length} assets for ${marketId} in Firestore.`);

    return {
        success: true,
        count: output.assets.length,
        marketId,
    };
  }
);
