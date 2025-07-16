
'use server';
/**
 * @fileOverview A set of AI tools for market analysis.
 * - getStockPriceFromFirestore: Fetches the current price of a stock from our database.
 * - findCompanyNameTool: Finds the full official name for a given stock ticker.
 * - findMarketAssetsTool: Finds a comprehensive list of assets for a given market.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { staticAssets } from '@/lib/data';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllStocks, findAllStocks } from '@/lib/stocks';


/**
 * Fetches the latest price for a stock from our Firestore database.
 * This data is assumed to be updated by an external process.
 * @param ticker The stock ticker symbol.
 * @returns A promise that resolves to the stock's price information or null.
 */
export async function getStockPriceFromFirestore(ticker: string): Promise<{ price: number; currency: string } | null> {
    if (!ticker) return null;

    try {
        // Try saudi_stocks first
        let stockRef = doc(db, "saudi_stocks", ticker.toUpperCase());
        let docSnap = await getDoc(stockRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                price: data.lastTradePrice || 0,
                currency: data.currency || 'SAR',
            };
        }

        // Then try uae_stocks
        stockRef = doc(db, "uae_stocks", ticker.toUpperCase());
        docSnap = await getDoc(stockRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                price: data.price,
                currency: data.currency,
            };
        }
        
        // Fallback for non-stock assets not in the dynamic list, like Gold or Bonds
        const staticAsset = staticAssets.find(a => a.ticker === ticker);
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


export const findCompanyNameTool = ai.defineTool(
    {
        name: 'findCompanyNameTool',
        description: 'Finds the full company name and ticker for a given query (which can be a name or ticker) by searching our master data list from Firestore.',
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
        const allStocks = await getAllStocks();
        const assets = [...allStocks, ...staticAssets];

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


export const findMarketAssetsTool = ai.defineTool(
    {
        name: 'findMarketAssetsTool',
        description: 'Finds a list of publicly traded stocks for a given market by querying our Firestore database.',
        inputSchema: z.object({
            market: z.enum(['SA', 'AE', 'EG']).describe('The stock market to search (SA: Saudi Arabia, AE: UAE, EG: Egypt).'),
        }),
        outputSchema: z.array(z.object({
            ticker: z.string().describe('The official ticker symbol.'),
            name: z.string().describe('The full official name of the company.'),
            name_ar: z.string().describe('The full official Arabic name of the company.'),
        })),
    },
    async ({ market }) => {
        console.log(`[findMarketAssetsTool] Fetching assets for ${market} from Firestore.`);
        const allStocks = await findAllStocks({ country: market });
        return allStocks
            .map(a => ({ ticker: a.ticker, name: a.name, name_ar: a.name_ar }));
    }
);
