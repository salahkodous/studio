
'use server';
/**
 * @fileOverview An AI flow that acts as a market analyst for a specific stock.
 *
 * - analyzeMarketForTicker: A function that uses AI tools to analyze a stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { findCompanyNameTool } from '../tools/market-tools';
import { MarketAnalysisInputSchema, MarketAnalysisSchema, type MarketAnalysis } from '../schemas/market-analysis-schema';

export async function analyzeMarketForTicker(input: z.infer<typeof MarketAnalysisInputSchema>): Promise<MarketAnalysis> {
  return marketAnalystFlow(input);
}

const analystPrompt = ai.definePrompt({
    name: 'marketAnalystPrompt',
    input: { schema: z.object({ 
        ticker: z.string(), 
        companyName: z.string(),
    }) },
    output: { schema: MarketAnalysisSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are "Tharawat", a sophisticated AI financial analyst for the Gulf markets. Your task is to provide a clear, concise, and insightful analysis of a specific stock based on general market knowledge. The entire output MUST be in Arabic.

    Stock to Analyze:
    - Ticker: {{{ticker}}}
    - Company Name: {{{companyName}}}

    Based on the company identity, perform the following analysis:

    1.  **Financial Analysis**: Write a brief paragraph summarizing the company's general financial standing and its position in the market. Mention its significance, common perception, and recent performance trends if widely known.

    2.  **News Summary**: Write a brief paragraph summarizing the general sentiment from recent major news events affecting the company or its sector.

    3.  **Recommendation**: Based on the general analysis, provide a clear recommendation.
        -   **Decision**: Your final verdict MUST be one of three options: "Buy", "Sell", or "Hold".
        -   **Confidence Score**: Provide a confidence score from 1 to 10 for your recommendation.
        -   **Justification**: Write a short, clear sentence explaining WHY you made that decision based on your analysis.

    Your final output must be ONLY the JSON object, without any extra text, explanations, or markdown formatting. Ensure all fields in the JSON are populated and in Arabic.
    `,
});

const marketAnalystFlow = ai.defineFlow(
  {
    name: 'marketAnalystFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisSchema,
    tools: [findCompanyNameTool],
  },
  async ({ query }) => {
    // Let the AI find the company name and ticker from the user's query.
    const companyInfo = await findCompanyNameTool({ query });

    console.log(`[marketAnalystFlow] Starting analysis for ${companyInfo.name_ar} (${companyInfo.ticker})`);
    
    try {
        const { output } = await analystPrompt({ 
            ticker: companyInfo.ticker, 
            companyName: companyInfo.name_ar,
        });

        if (!output) {
            throw new Error("The AI analyst did not generate a response.");
        }

        const parsedOutput = MarketAnalysisSchema.safeParse(output);
        if (!parsedOutput.success) {
            console.error("[marketAnalystFlow] Zod validation failed:", parsedOutput.error);
            throw new Error("The AI returned data in an unexpected format. Please try again.");
        }
        
        // Ensure the output from the AI has the ticker and name we used, overriding any hallucinations.
        return {
            ...parsedOutput.data,
            ticker: companyInfo.ticker,
            companyName: companyInfo.name_ar,
        };

    } catch(error) {
        console.error("[marketAnalystFlow] Failed to generate or validate analysis:", error);
        throw new Error("Failed to get a valid analysis from the AI. It might be experiencing high load or the ticker is not supported.");
    }
  }
);
