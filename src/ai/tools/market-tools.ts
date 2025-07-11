
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
    return `https://www.google.com/finance/quote/${assets.find(a => a.name === companyName)?.ticker}:TADAWUL`;
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
        // First, check our local mock data for a quick answer
        const asset = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
        if (asset) {
            return asset.name;
        }

        // If not found, simulate a web search. In a real app, this would use the web scraper.
        console.log(`[findCompanyNameTool] Simulating web search for company name of ticker: ${ticker}`);
        // This is a simplified simulation. A real implementation would scrape a search results page.
        // For this prototype, we'll return a formatted name based on the ticker.
        return `${ticker.charAt(0).toUpperCase() + ticker.slice(1).toLowerCase()} Corp`;
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
    console.log(`[getStockPriceTool] Fetching price for ${ticker} from Twelve Data API`);
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) throw new Error("Twelve Data API key is not configured.");
    
    const assetDetails = assets.find(a => a.ticker === ticker);
    const exchange = assetDetails?.country === 'SA' ? 'Tadawul' : assetDetails?.country === 'QA' ? 'QSE' : 'DFM';

    const url = `https://api.twelvedata.com/price?symbol=${ticker}&exchange=${exchange}&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.price) {
            return {
                price: parseFloat(data.price),
                currency: assetDetails?.currency || 'USD',
                sourceUrl: `https://twelvedata.com/symbol/${ticker}/${exchange}`,
            };
        } else {
            console.warn(`[getStockPriceTool] Twelve Data API did not return a price for ${ticker}. Falling back to mock data.`);
            return { price: assetDetails?.price || 0, currency: assetDetails?.currency || 'USD', sourceUrl: `https://twelvedata.com/` };
        }
    } catch (error) {
        console.error(`[getStockPriceTool] Error fetching from Twelve Data API:`, error);
        return { price: assetDetails?.price || 0, currency: assetDetails?.currency || 'USD', sourceUrl: `https://twelvedata.com/` };
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
  async ({ companyName }) => {
    console.log(`[getLatestNewsTool] AI agent is looking up URL for news for: ${companyName}`);
    const url = await findCompanyUrlTool({ companyName });

    console.log(`[getLatestNewsTool] AI agent is scraping news from: ${url}`);
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


const translateToArabicPrompt = ai.definePrompt({
  name: 'translateToArabicPrompt',
  input: { schema: z.object({ assets: z.array(z.object({ ticker: z.string(), name: z.string() })) }) },
  output: { schema: z.array(z.object({ ticker: z.string(), name: z.string() })) },
  prompt: `Translate the 'name' field of each JSON object in the following array to Arabic. Maintain the 'ticker' field as is. Respond with only the translated JSON array.

Input:
{{{json assets}}}

Translated Output (JSON array only):
`,
});


export const findMarketAssetsTool = ai.defineTool(
    {
        name: 'findMarketAssetsTool',
        description: 'Finds a list of publicly traded stocks for a given market by querying the Twelve Data API, with a fallback to a static list.',
        inputSchema: z.object({
            market: z.enum(['SA', 'AE', 'QA']).describe('The stock market to search (SA: Saudi Arabia, AE: UAE, QA: Qatar).'),
        }),
        outputSchema: z.array(z.object({
            ticker: z.string().describe('The official ticker symbol.'),
            name: z.string().describe('The full official name of the company.'),
        })),
    },
    async ({ market }) => {
        const apiKey = process.env.TWELVE_DATA_API_KEY;
        if (!apiKey) {
            console.error("[findMarketAssetsTool] Twelve Data API key is not configured.");
            // Fallback to static data if API key is missing
            return assets
                .filter(a => a.country === market && a.category === 'Stocks')
                .map(a => ({ ticker: a.ticker, name: a.name }));
        }

        const exchangeMap = {
            SA: 'Tadawul',
            AE: 'DFM',
            QA: 'QSE',
        };
        const exchange = exchangeMap[market];
        const url = `https://api.twelvedata.com/stocks?exchange=${exchange}&country=${market}`;

        try {
            console.log(`[findMarketAssetsTool] Fetching assets for ${market} from Twelve Data API...`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const result = await response.json();
            
            if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                 const englishAssets = result.data.map((asset: any) => ({
                    ticker: asset.symbol,
                    name: asset.name,
                }));

                console.log(`[findMarketAssetsTool] Translating ${englishAssets.length} asset names to Arabic...`);
                const { output } = await translateToArabicPrompt({ assets: englishAssets });

                if (!output) {
                    console.warn(`[findMarketAssetsTool] AI translation failed. Returning English names.`);
                    return englishAssets;
                }

                return output;

            } else {
                 console.warn(`[findMarketAssetsTool] No assets returned from Twelve Data for ${market}. Falling back to static data.`);
                 throw new Error("Empty data from API");
            }
        } catch (error) {
            console.error(`[findMarketAssetsTool] Error fetching from Twelve Data API, using fallback data. Error:`, error);
            return assets
                .filter(a => a.country === market && a.category === 'Stocks')
                .map(a => ({ ticker: a.ticker, name: a.name }));
        }
    }
);
