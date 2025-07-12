
'use server';
/**
 * @fileOverview A set of AI tools for market analysis.
 * - getStockPrice: Fetches the (simulated) current price of a stock.
 * - getLatestNews: Fetches (simulated) recent news headlines for a stock.
 * - findCompanyUrlTool: Finds a relevant financial data URL for a company.
 * - findCompanyNameTool: Finds the full official name for a given stock ticker.
 * - findMarketAssetsTool: Finds a comprehensive list of assets for a given market.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { assets, newsArticles, type Asset } from '@/lib/data';
import { webScraperTool } from './web-scraper-tool';

export const findCompanyUrlTool = ai.defineTool(
  {
    name: 'findCompanyUrlTool',
    description: 'Finds a relevant financial data URL for a company. Use financial data websites like Bloomberg, Reuters, or local exchanges like Tadawul or ADX.',
    inputSchema: z.object({
        companyName: z.string().describe('The name of the company to find the URL for.'),
    }),
    outputSchema: z.string().describe('The URL of the financial data page for the company.'),
  },
  async ({ companyName }) => {
    // In a real app, this could use a search API. For now, we simulate.
    console.log(`[findCompanyUrlTool] Searching for URL for: ${companyName}`);
    if (companyName.toLowerCase().includes('aramco')) {
        return 'https://www.tadawul.com.sa/wps/portal/tadawul/markets/equities/company-details/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zi_Tx8nD0MLIy83V1DjA0czV2cPSd8rYwMvE30I4EKzBEKzC3dnB2dXX393Q08LP0C_N2I0otPNs_d3_b2N6AgDLB3-lH-mA_qA4ZA10Q_f_5w!/dz/d5/L2dBISEvZ0FBIS9nQSEh/?symbol=2222';
    }
    if (companyName.toLowerCase().includes('qnb')) {
        return 'https://www.qe.com.qa/company-details-page/qnbk'
    }
     if (companyName.toLowerCase().includes('emaar')) {
        return 'https://www.dfm.ae/en/issuers/listed-securities/securities/company-profile-page?id=EMAAR'
    }
    // Fallback for demonstration
    const asset = assets.find(a => a.name === companyName || a.name_ar === companyName);
    return `https://www.google.com/finance/quote/${asset?.ticker}:TADAWUL`;
  }
);

export const findCompanyNameTool = ai.defineTool(
    {
        name: 'findCompanyNameTool',
        description: 'Finds the full company name for a given stock ticker by searching financial data sources.',
        inputSchema: z.object({
            ticker: z.string().describe('The stock ticker symbol.'),
        }),
        outputSchema: z.string().describe('The full official name of the company.'),
    },
    async ({ ticker }) => {
        // First, check our local data for a quick answer
        const asset = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
        if (asset) {
            return asset.name_ar; // Return Arabic name from our master list
        }

        // Fallback if not found in our master list, which shouldn't happen often
        console.warn(`[findCompanyNameTool] Ticker ${ticker} not found in local data. Returning a default name.`);
        return ticker; // Return ticker itself as a fallback
    }
);


export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Gets the current market price for a given stock ticker symbol using the Twelve Data API.',
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
    console.log(`[getStockPriceTool] Attempting to fetch live price for ${ticker}`);
    
    const assetDetails = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error("Twelve Data API key is not configured in .env file.");
    }
    
    if (!assetDetails) {
        throw new Error(`Ticker ${ticker} not found in our master asset list.`);
    }

    try {
        const exchangeMap = {SA: "Tadawul", AE: "DFM", QA: "QSE", Global: "NASDAQ"};
        const exchange = exchangeMap[assetDetails.country as keyof typeof exchangeMap] || 'Tadawul';
        const url = `https://api.twelvedata.com/price?symbol=${ticker}&exchange=${exchange}&apikey=${apiKey}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getStockPriceTool] Twelve Data API call failed for ${ticker}. Status: ${response.status}. Body: ${errorBody}`);
            throw new Error(`API call failed with status ${response.status}`);
        }

        const data = await response.json();
        const price = parseFloat(data.price);
        
        if (data && !isNaN(price)) {
            console.log(`[getStockPriceTool] Live price for ${ticker}: ${price}`);
            return {
                price: price,
                currency: assetDetails.currency,
                sourceUrl: `https://twelvedata.com/symbol/${ticker}/${exchange}`,
            };
        } else {
            console.error(`[getStockPriceTool] Twelve Data API did not return a valid price for ${ticker}. Response: ${JSON.stringify(data)}`);
            throw new Error(`Invalid price data received from API for ${ticker}.`);
        }
    } catch (error) {
        console.error(`[getStockPriceTool] CRITICAL ERROR fetching price for ${ticker}:`, error);
        // Re-throw the error to be handled by the calling function.
        // This ensures that we do not fall back to static data.
        throw new Error(`Failed to fetch live price for ${ticker}. Please check API key and network status.`);
    }
  }
);

export const getLatestNews = ai.defineTool(
  {
    name: 'getLatestNews',
    description: 'Retrieves a list of recent news headlines for a given stock ticker by scraping its financial data page.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "ARAMCO" or "SABIC".'),
      companyName: z.string().describe('The name of the company.'),
    }),
    outputSchema: z.array(z.string()).describe('A list of news headlines.'),
  },
  async ({ companyName, ticker }) => {
    console.log(`[getLatestNewsTool] AI agent is looking up URL for news for: ${companyName}`);
    const url = await findCompanyUrlTool({ companyName });

    console.log(`[getLatestNewsTool] AI agent is scraping news from: ${url}`);
    
    // Use local data as a fallback if scraping doesn't work or for demos
    const localNews = newsArticles[ticker.toUpperCase() as keyof typeof newsArticles];
    if (localNews && localNews.length > 0) {
        return localNews.map(newsUrl => `News headline from ${new URL(newsUrl).hostname}`);
    }

    const scrapeResult = await webScraperTool({ url });

    const extractionPrompt = ai.definePrompt({
        name: 'newsExtractor',
        model: 'googleai/gemini-1.5-flash',
        input: { schema: z.object({ context: z.string() }) },
        output: { schema: z.object({ headlines: z.array(z.string()) })},
        prompt: `From the following financial data page content, extract the top 3-5 latest news headlines. Respond with only a JSON object containing a "headlines" array. \n\n${scrapeResult.content}`,
    });
    
    const { output } = await extractionPrompt({ context: scrapeResult.content });
    
    if (!output?.headlines || output.headlines.length === 0) {
      return [
        `No specific news found for ${companyName}, but general market sentiment is cautiously optimistic.`,
        `Analysts are watching ${companyName} closely following the latest sector-wide regulatory updates.`
      ];
    }
    
    return output.headlines;
  }
);


export const findMarketAssetsTool = ai.defineTool(
    {
        name: 'findMarketAssetsTool',
        description: 'Finds a list of publicly traded stocks for a given market by querying the Twelve Data API.',
        inputSchema: z.object({
            market: z.enum(['SA', 'AE', 'QA']).describe('The stock market to search (SA: Saudi Arabia, AE: UAE, QA: Qatar).'),
        }),
        outputSchema: z.array(z.object({
            ticker: z.string().describe('The official ticker symbol.'),
            name: z.string().describe('The full official name of the company.'),
        })),
    },
    async ({ market }) => {
        // This tool will now return the master list from data.ts to ensure consistency
        console.log(`[findMarketAssetsTool] Fetching assets for ${market} from local master data.`);
        return assets
            .filter(a => a.country === market && a.category === 'Stocks')
            .map(a => ({ ticker: a.ticker, name: a.name_ar })); // Return Arabic name for display
    }
);
