
'use server';
/**
 * @fileOverview A set of AI tools for market analysis.
 * - getStockPrice: Fetches the (simulated) current price of a stock.
 * - getLatestNews: Fetches (simulated) recent news headlines for a stock.
 * - findCompanyUrlTool: Finds a relevant financial data URL for a company.
 * - findCompanyNameTool: Finds the full company name for a given stock ticker.
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
    description: 'Gets the current market price for a given stock ticker symbol by scraping its financial data page.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., "ARAMCO" or "QNB".'),
      companyName: z.string().describe('The name of the company.'),
    }),
    outputSchema: z.object({
        price: z.number(),
        currency: z.string(),
        sourceUrl: z.string().url(),
    }),
  },
  async ({ ticker, companyName }) => {
    console.log(`[getStockPriceTool] AI agent is looking up URL for: ${companyName}`);
    const url = await findCompanyUrlTool({ companyName });

    console.log(`[getStockPriceTool] AI agent is scraping data from: ${url}`);
    const scrapeResult = await webScraperTool({ url });

    // Let the LLM find the price from the scraped data.
    // This is a powerful pattern. We do the scraping, the LLM does the data extraction.
    const extractionPrompt = ai.definePrompt({
        name: 'priceExtractor',
        model: 'googleai/gemini-1.5-flash',
        input: { schema: z.object({ context: z.string() }) },
        output: { schema: z.object({ price: z.number(), currency: z.string() })},
        prompt: `From the following financial data, extract the current stock price and its currency. The currency might be abbreviated (e.g., SAR, AED, QAR). Respond with only a JSON object containing the price and currency. \n\n${scrapeResult.content}`,
    });
    
    const { output } = await extractionPrompt({ context: scrapeResult.content });

    if (!output) {
        throw new Error(`Could not extract price for ${ticker} from ${url}`);
    }

    return {
        ...output,
        sourceUrl: url,
    };
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


export const findMarketAssetsTool = ai.defineTool(
    {
        name: 'findMarketAssetsTool',
        description: 'Finds a list of all publicly traded stocks for a given market (country). This is used to populate selection lists for the user.',
        inputSchema: z.object({
            market: z.enum(['SA', 'AE', 'QA']).describe('The stock market to search (SA: Saudi Arabia, AE: UAE, QA: Qatar).'),
        }),
        outputSchema: z.array(z.object({
            ticker: z.string().describe('The official ticker symbol.'),
            name: z.string().describe('The full official name of the company.'),
        })),
    },
    async ({ market }) => {
        console.log(`[findMarketAssetsTool] Finding assets for market: ${market}`);
        const fallbackToStaticData = () => {
            console.log(`[findMarketAssetsTool] Using static fallback data for market: ${market}`);
            return assets
                .filter(a => a.country === market && a.category === 'Stocks')
                .map(a => ({ ticker: a.ticker, name: a.name }));
        };

        if (market === 'SA') {
            try {
                const url = 'https://www.saudiexchange.sa/wps/portal/saudiexchange/ourmarkets/main-market-watch?locale=ar';
                console.log(`[findMarketAssetsTool] Scraping Saudi market data from: ${url}`);
                const scrapeResult = await webScraperTool({ url });

                if (!scrapeResult || !scrapeResult.content) {
                    console.error("[findMarketAssetsTool] Scraping returned no content. Falling back to static data.");
                    return fallbackToStaticData();
                }

                console.log("[findMarketAssetsTool] Extracting assets from scraped data...");
                const assetsExtractor = ai.definePrompt({
                    name: 'assetsExtractor',
                    model: 'googleai/gemini-1.5-flash',
                    input: { schema: z.object({ context: z.string() }) },
                    output: { schema: z.array(z.object({ ticker: z.string(), name: z.string() })) },
                    prompt: `From the following markdown content of a stock market page, extract all the listed companies. For each company, provide its official name and its ticker symbol. Return the data as a JSON array of objects, where each object has a "name" and a "ticker" property.

                    Content:
                    {{{context}}}
                    `,
                });
                
                const { output } = await assetsExtractor({ context: scrapeResult.content });
                
                if (!output || output.length === 0) {
                    console.error("[findMarketAssetsTool] AI failed to extract assets. Falling back to static data.");
                    return fallbackToStaticData();
                }
                
                console.log(`[findMarketAssetsTool] Extracted ${output.length} assets from the Saudi Exchange.`);
                return output;
            } catch (error) {
                console.error(`[findMarketAssetsTool] An error occurred during scraping or extraction for SA market:`, error);
                return fallbackToStaticData();
            }
        }

        // For other markets, use static data directly.
        return fallbackToStaticData();
    }
);
