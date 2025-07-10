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
    input: { schema: z.object({ ticker: z.string(), companyName: z.string() }) },
    output: { schema: MarketAnalysisSchema },
    model: 'googleai/gemini-1.5-flash',
    tools: [getStockPrice, getLatestNews],
    prompt: `You are "Tharawat", a sophisticated AI financial analyst for the Gulf markets. Your task is to provide a clear, concise, and insightful analysis of a specific stock based on the provided data. The entire output MUST be in Arabic.

    Stock to Analyze:
    - Ticker: {{{ticker}}}
    - Company Name: {{{companyName}}}

    Use the available tools to get the latest stock price and news headlines. Then, based on ALL the information you have gathered, perform the following analysis:

    1.  **Financial Analysis**: Write a brief paragraph summarizing the company's financial standing based on its latest stock price. Is it performing well? Is it volatile? What is its general position in the market?

    2.  **News Summary**: Write a brief paragraph summarizing the key takeaways from the recent news headlines. What are the key events or sentiments affecting the company?

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
    // Find the company name from our mock data
    const assetInfo = assets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase());
    const companyName = assetInfo ? assetInfo.name : ticker;

    console.log(`[marketAnalystFlow] Starting analysis for ${companyName} (${ticker})`);

    const { output } = await analystPrompt({ ticker, companyName });
    
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
