// This is a new file for market analysis tools
'use server';
/**
 * @fileOverview A set of AI tools for market analysis.
 * - getStockPrice: Fetches the (simulated) current price of a stock.
 * - getLatestNews: Fetches (simulated) recent news headlines for a stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { assets, newsArticles } from '@/lib/data';

export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Gets the current market price for a given stock ticker symbol.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "ARAMCO" or "QNB".'),
    }),
    outputSchema: z.object({
        price: z.number(),
        currency: z.string(),
    }),
  },
  async (input) => {
    console.log(`[getStockPriceTool] AI agent is looking up price for: ${input.ticker}`);
    const asset = assets.find(a => a.ticker.toLowerCase() === input.ticker.toLowerCase());

    if (asset) {
      // Simulate minor market fluctuation for dynamic feel
      const simulatedPrice = asset.price * (1 + (Math.random() - 0.5) * 0.05); // +/- 2.5% fluctuation
      return {
        price: parseFloat(simulatedPrice.toFixed(2)),
        currency: asset.currency,
      };
    } else {
      // Return a default value if not found in our mock data
      return {
        price: 50 + Math.random() * 100, // Random price
        currency: 'USD',
      };
    }
  }
);

export const getLatestNews = ai.defineTool(
  {
    name: 'getLatestNews',
    description: 'Retrieves a list of recent news headlines for a given stock ticker.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "ARAMCO" or "SABIC".'),
    }),
    outputSchema: z.array(z.string()).describe('A list of news headlines.'),
  },
  async (input) => {
    console.log(`[getLatestNewsTool] AI agent is fetching news for: ${input.ticker}`);
    
    // Use mock data, but simulate a real API call
    const articles = newsArticles[input.ticker.toUpperCase()] || [
        `No specific news found for ${input.ticker}, but general market sentiment is cautiously optimistic.`,
        `Analysts are watching ${input.ticker} closely following the latest sector-wide regulatory updates.`
    ];
    
    // Simulate transforming URLs into headlines
    return articles.map(url => {
        try {
            const path = new URL(url).pathname;
            const parts = path.split('/').filter(p => p && p.length > 10);
            return parts.length > 0 ? parts[parts.length-1].replace(/-/g, ' ') : `Report on ${input.ticker}`;
        } catch {
            return url; // If it's not a URL, return as is
        }
    });
  }
);
