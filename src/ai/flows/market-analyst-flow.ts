
'use server';
/**
 * @fileOverview An AI flow that acts as a market analyst for a specific stock.
 *
 * - analyzeMarketForTicker: A function that uses AI tools to analyze a stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { findFinancialData, findCompanyNameTool } from '../tools/market-tools';
import { MarketAnalysisInputSchema, MarketAnalysisSchema, type MarketAnalysis } from '../schemas/market-analysis-schema';

export async function analyzeMarketForTicker(input: z.infer<typeof MarketAnalysisInputSchema>): Promise<MarketAnalysis> {
  return marketAnalystFlow(input);
}

const analystPrompt = ai.definePrompt({
    name: 'marketAnalystPrompt',
    input: { schema: z.object({ 
        ticker: z.string(), 
        companyName: z.string(),
        scrapedFinancialData: z.string(), // The AI will now work with the raw scraped text
    }) },
    output: { schema: MarketAnalysisSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are "Tharawat", a sophisticated AI financial analyst for the Gulf markets. Your task is to provide a clear, concise, and insightful analysis of a specific stock based on the provided scraped data from its financial page. The entire output MUST be in Arabic.

    Stock to Analyze:
    - Ticker: {{{ticker}}}
    - Company Name: {{{companyName}}}

    Here is the raw text content scraped from their financial data page:
    ---
    {{{scrapedFinancialData}}}
    ---

    Based on the content provided above, perform the following analysis:

    1.  **Financial Analysis**: Find the most recent stock price in the text. Write a brief paragraph summarizing the company's financial standing based on this price and any other relevant financial metrics you can find (like market cap, P/E ratio, etc.). Is it performing well? Is it volatile? What is its general position in the market?

    2.  **News Summary**: Identify and extract the key news headlines from the text. Write a brief paragraph summarizing the key takeaways from these headlines. What are the key events or sentiments affecting the company?

    3.  **Recommendation**: Based on the price and news, provide a clear recommendation.
        -   **Decision**: Your final verdict MUST be one of three options: "Buy", "Sell", or "Hold".
        -   **Confidence Score**: Provide a confidence score from 1 to 10 for your recommendation.
        -   **Justification**: Write a short, clear sentence explaining WHY you made that decision based on the scraped data.

    Your final output must be ONLY the JSON object, without any extra text, explanations, or markdown formatting. Ensure all fields in the JSON are populated and in Arabic.
    `,
});

const marketAnalystFlow = ai.defineFlow(
  {
    name: 'marketAnalystFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisSchema,
    tools: [findFinancialData], // Provide the tool to the flow
  },
  async ({ ticker }) => {
    // Let the AI find the company name from the ticker using our reliable internal data.
    const companyName = await findCompanyNameTool({ ticker });

    console.log(`[marketAnalystFlow] Starting analysis for ${companyName} (${ticker})`);

    // The AI will use this tool to gather live data. The prompt will guide it.
    // The tool finds the right URL and scrapes it.
    const financialData = await findFinancialData({ ticker, companyName });
    
    console.log('[marketAnalystFlow] Data gathered, generating analysis...');
    
    try {
        const { output } = await analystPrompt({ 
            ticker, 
            companyName,
            scrapedFinancialData: financialData.content, // Pass the raw scraped content to the prompt
        });

        if (!output) {
            throw new Error("The AI analyst did not generate a response.");
        }

        // Validate the output against the Zod schema to ensure it's in the correct format.
        const parsedOutput = MarketAnalysisSchema.safeParse(output);
        if (!parsedOutput.success) {
            console.error("[marketAnalystFlow] Zod validation failed:", parsedOutput.error);
            throw new Error("The AI returned data in an unexpected format. Please try again.");
        }
        
        // Ensure the output from the AI has the ticker and name we used, overriding any hallucinations.
        return {
            ...parsedOutput.data,
            ticker,
            companyName,
        };

    } catch(error) {
        console.error("[marketAnalystFlow] Failed to generate or validate analysis:", error);
        throw new Error("Failed to get a valid analysis from the AI. It might be experiencing high load or the ticker is not supported.");
    }
  }
);
