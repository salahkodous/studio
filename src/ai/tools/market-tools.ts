
'use server';
/**
 * @fileOverview A set of AI tools for market analysis.
 * - getStockPriceFromFirestore: Fetches the (simulated) current price of a stock from our database.
 * - findFinancialData: A tool to find and scrape a company's financial data page.
 * - findCompanyNameTool: Finds the full official name for a given stock ticker.
 * - findMarketAssetsTool: Finds a comprehensive list of assets for a given market.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { assets, newsArticles, type Asset } from '@/lib/data';
import { webScraperTool } from './web-scraper-tool';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


/**
 * Fetches the latest price for a stock from our Firestore database.
 * This data is updated daily by a scheduled backend job.
 * @param ticker The stock ticker symbol.
 * @returns A promise that resolves to the stock's price information or null.
 */
export async function getStockPriceFromFirestore(ticker: string): Promise<{ price: number; currency: string } | null> {
    if (!ticker) return null;

    try {
        const stockRef = doc(db, "saudi_stocks", ticker);
        const docSnap = await getDoc(stockRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                price: data.price,
                currency: data.currency,
            };
        }
        
        // Fallback for assets not in the dynamic list, like Gold or Bonds
        const staticAsset = assets.find(a => a.ticker === ticker);
        if (staticAsset) {
            return {
                price: staticAsset.price,
                currency: staticAsset.currency,
            }
        }
    } catch (error) {
        console.error(`[getStockPriceFromFirestore] Error fetching price for ${ticker}:`, error);
    }
    
    return null;
}

export const findFinancialData = ai.defineTool(
    {
        name: 'findFinancialData',
        description: 'Finds a relevant financial data URL for a company (e.g., from Google Finance, Bloomberg, or a local exchange) and scrapes its content. This is the primary tool for gathering real-time market data for analysis.',
        inputSchema: z.object({
            companyName: z.string().describe('The name of the company to find data for.'),
            ticker: z.string().describe('The ticker symbol of the company.'),
        }),
        outputSchema: z.object({
            url: z.string().url().describe('The URL that was scraped.'),
            content: z.string().describe('The scraped content of the page in Markdown format.'),
        }),
    },
    async ({ companyName, ticker }) => {
        // Find a relevant URL
        console.log(`[findFinancialData] Searching for URL for: ${companyName}`);
        
        const asset = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
        
        let url;
        if (asset) {
            // Prefer a reliable source like Google Finance if we have the ticker
            const marketSuffix = asset.country === 'SA' ? 'TADAWUL' : asset.country === 'AE' ? 'ADX' : 'QSE';
            url = `https://www.google.com/finance/quote/${asset.ticker}:${marketSuffix}`;
        } else {
             // Fallback for demonstration if asset not in our list
            url = `https://www.google.com/search?q=stock+price+${companyName.replace(/\s/g, '+')}`;
        }

        console.log(`[findFinancialData] Scraping financial data from: ${url}`);
        const scrapeResult = await webScraperTool({ url });

        return {
            url: url,
            content: scrapeResult.content,
        };
    }
);


export const findCompanyNameTool = ai.defineTool(
    {
        name: 'findCompanyNameTool',
        description: 'Finds the full company name and ticker for a given query (which can be a name or ticker) by searching our master data list.',
        inputSchema: z.object({
            query: z.string().describe('The user query, which can be a stock ticker symbol or a company name.'),
        }),
        outputSchema: z.object({
            ticker: z.string().describe('The resolved official ticker symbol.'),
            name: z.string().describe('The resolved official English name of the company.'),
            name_ar: z.string().describe('The resolved official Arabic name of the company.'),
        }),
    },
    async ({ query }) => {
        const normalizedQuery = query.trim().toUpperCase();

        // 1. Exact ticker match
        let asset = assets.find(a => a.ticker.toUpperCase() === normalizedQuery);
        if (asset) {
            return { ticker: asset.ticker, name: asset.name, name_ar: asset.name_ar };
        }

        // 2. Exact name match (Arabic or English)
        asset = assets.find(a => a.name.toUpperCase() === normalizedQuery || a.name_ar.toUpperCase() === normalizedQuery);
        if (asset) {
            return { ticker: asset.ticker, name: asset.name, name_ar: asset.name_ar };
        }

        // 3. Partial name match (more fuzzy)
        asset = assets.find(a => 
            a.name.toUpperCase().includes(normalizedQuery) || 
            a.name_ar.includes(query.trim()) // case-sensitive for Arabic partial match
        );
        if (asset) {
            return { ticker: asset.ticker, name: asset.name, name_ar: asset.name_ar };
        }

        throw new Error(`Could not find a matching company for query: "${query}". Please try a more specific name or the exact ticker symbol.`);
    }
);


// DEPRECATED - This tool is no longer used by the primary analysis flow.
// It is kept for potential other uses or direct price lookups from the DB.
export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: '[DEPRECATED] Gets the most recent end-of-day price for a given stock ticker from our internal database.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "2222" or "QNBK".'),
      companyName: z.string().describe('The name of the company.'),
    }),
    outputSchema: z.object({
        price: z.number(),
        currency: z.string(),
        sourceUrl: z.string().url(),
    }),
  },
  async ({ ticker }) => {
    console.log(`[getStockPriceTool] Fetching price for ${ticker} from Firestore.`);
    
    const priceData = await getStockPriceFromFirestore(ticker);
    
    if (priceData) {
        return {
            price: priceData.price,
            currency: priceData.currency,
            sourceUrl: 'https://tharawat-app.dev/firestore-db' // Placeholder source
        };
    }

    // If we reach here, the price wasn't in Firestore or the static list.
    throw new Error(`Price for ticker ${ticker} not found in our database. The daily update may have failed or this ticker is not tracked.`);
  }
);

// DEPRECATED - This tool is no longer used by the primary analysis flow.
// The main `findFinancialData` tool now handles scraping and the prompt handles extraction.
export const getLatestNews = ai.defineTool(
  {
    name: 'getLatestNews',
    description: '[DEPRECATED] Retrieves a list of recent news headlines for a given stock ticker by scraping its financial data page.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "ARAMCO" or "SABIC".'),
      companyName: z.string().describe('The name of the company.'),
    }),
    outputSchema: z.array(z.string()).describe('A list of news headlines.'),
  },
  async ({ companyName, ticker }) => {
    console.warn("[getLatestNewsTool] This tool is deprecated and should not be used in new flows.");
    // Fallback to local data if available
    const localNews = newsArticles[ticker.toUpperCase() as keyof typeof newsArticles];
    if (localNews && localNews.length > 0) {
        return localNews.map(newsUrl => `News headline from ${new URL(newsUrl).hostname}`);
    }
    return [
        `No specific news found for ${companyName}, but general market sentiment is cautiously optimistic.`,
        `Analysts are watching ${companyName} closely following the latest sector-wide regulatory updates.`
      ];
  }
);


export const findMarketAssetsTool = ai.defineTool(
    {
        name: 'findMarketAssetsTool',
        description: 'Finds a list of publicly traded stocks for a given market by querying our local master data file.',
        inputSchema: z.object({
            market: z.enum(['SA', 'AE', 'QA']).describe('The stock market to search (SA: Saudi Arabia, AE: UAE, QA: Qatar).'),
        }),
        outputSchema: z.array(z.object({
            ticker: z.string().describe('The official ticker symbol.'),
            name: z.string().describe('The full official name of the company.'),
            name_ar: z.string().describe('The full official Arabic name of the company.'),
        })),
    },
    async ({ market }) => {
        // This tool will now return the master list from data.ts to ensure consistency
        console.log(`[findMarketAssetsTool] Fetching assets for ${market} from local master data.`);
        return assets
            .filter(a => a.country === market && a.category === 'Stocks')
            .map(a => ({ ticker: a.ticker, name: a.name, name_ar: a.name_ar }));
    }
);
