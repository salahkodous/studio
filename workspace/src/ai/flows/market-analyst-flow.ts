// This is a new file for the Market Analyst AI Agent flow
'use server';
/**
 * @fileOverview An AI flow that acts as a market analyst for a specific stock.
 *
 * - analyzeMarketForTicker: A function that uses AI tools to analyze a stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getStockPrice, getLatestNews } from '../tools/market-tools';
import { MarketAnalysisInputSchema, MarketAnalysisSchema, type MarketAnalysis } from '../schemas/market-analysis-schema';
import { assets } from '@/lib/data';

export async function analyzeMarketForTicker(input: z.infer<typeof MarketAnalysisInputSchema>): Promise<MarketAnalysis> {
  return marketAnalystFlow(input);
}

const analystPrompt = ai.definePrompt({
    name: 'marketAnalystPrompt',
    input: { schema: z.object({ 
        ticker: z.string(), 
        companyName: z.string(),
        scrapedPriceData: z.any(),
        scrapedNewsData: z.any()
    }) },
    output: { schema: MarketAnalysisSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are "Tharawat", a sophisticated AI financial analyst for the Gulf markets. Your task is to provide a clear, concise, and insightful analysis of a specific stock based on the provided data. The entire output MUST be in Arabic.

    Stock to Analyze:
    - Ticker: {{{ticker}}}
    - Company Name: {{{companyName}}}

    Here is the live data you have gathered:
    - Current Price: {{scrapedPriceData.price}} {{scrapedPriceData.currency}} (Source: {{scrapedPriceData.sourceUrl}})
    - Recent News: {{#each scrapedNewsData}} - {{{this}}} {{/each}}

    Based on ALL the information you have gathered, perform the following analysis:

    1.  **Financial Analysis**: Write a brief paragraph summarizing the company's financial standing based on its latest stock price. Is it performing well? Is it volatile? What is its general position in the market? Refer to the live price you found.

    2.  **News Summary**: Write a brief paragraph summarizing the key takeaways from the recent news headlines you found. What are the key events or sentiments affecting the company?

    3.  **Recommendation**: Based on the price and news, provide a clear recommendation.
        -   **Decision**: Your final verdict MUST be one of three options: "Buy", "Sell", or "Hold".
        -   **Confidence Score**: Provide a confidence score from 1 to 10 for your recommendation.
        -   **Justification**: Write a short, clear sentence explaining WHY you made that decision.

    Your final output must be ONLY the JSON object, without any extra text, explanations, or markdown formatting. Ensure all fields in the JSON are populated and in Arabic.
    `,
});

const marketAnalystFlow = ai.defineFlow(
  {
    name: 'marketAnalystFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisSchema,
  },
  async ({ ticker }) => {
    // Find the company name from our mock data, this could also come from user input
    const assetInfo = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
    const companyName = assetInfo ? assetInfo.name : ticker;

    console.log(`[marketAnalystFlow] Starting analysis for ${companyName} (${ticker})`);

    // The AI will use these tools to gather live data.
    const scrapedPriceData = await getStockPrice({ ticker, companyName });
    const scrapedNewsData = await getLatestNews({ ticker, companyName });
    
    console.log('[marketAnalystFlow] Data gathered, generating analysis...');
    
    const { output } = await analystPrompt({ 
        ticker, 
        companyName,
        scrapedPriceData,
        scrapedNewsData
    });
    
    if (!output) {
      throw new Error("The AI analyst failed to generate a response.");
    }

    // Ensure the output from the AI has the ticker and name we used, overriding any hallucinations.
    return {
        ...output,
        ticker,
        companyName,
    };
  }
);
