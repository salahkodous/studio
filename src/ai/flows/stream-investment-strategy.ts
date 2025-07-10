
'use server';
/**
 * @fileOverview Streams an investment strategy based on user inputs.
 *
 * - streamInvestmentStrategy - A function that creates a personalized investment plan and streams the output.
 */

import {ai} from '@/ai/genkit';
import {
  type InvestmentStrategyInput,
  InvestmentStrategyInputSchema,
  InvestmentStrategyOutputSchema,
  type InvestmentStrategyOutput,
} from '@/ai/schemas/investment-strategy-schema';
import {type Stream, type Response} from 'genkit';

export async function streamInvestmentStrategy(
  input: InvestmentStrategyInput
): Promise<{stream: Stream<InvestmentStrategyOutput>; response: Response<InvestmentStrategyOutput>}> {
  return investmentStrategyStreamFlow(input);
}

const investmentStrategyStreamFlow = ai.defineFlow(
  {
    name: 'investmentStrategyStreamFlow',
    inputSchema: InvestmentStrategyInputSchema,
    outputSchema: InvestmentStrategyOutputSchema,
  },
  async (input) => {
    // Dynamically build the prompt string in JavaScript to avoid template errors.
    const promptText = `You are an expert financial advisor specializing in investment opportunities within the GCC (Gulf Cooperation Council) countries. Your task is to create a personalized investment strategy for a client based on their profile. The output MUST be in Arabic.

Client Profile:
- Investment Capital: $${input.capital} USD
- Interested Asset Categories: ${input.categories.join(', ')}
- Risk Tolerance: ${input.riskLevel}
- Investment Goals: ${input.investmentGoals}

Based on this profile, generate a comprehensive and actionable investment strategy. If the user specified a custom category like "Art" or "Collectibles", be sure to include analysis and recommendations for that specific interest.

Your response should include:
1.  **Strategy Title:** A clear and concise title for the strategy.
2.  **Strategy Summary:** A paragraph summarizing the overall approach, tailored to the client's risk level and goals.
3.  **Asset Allocation:** A breakdown of how the capital should be allocated across the selected categories. Provide a percentage and a short rationale for each allocation. The total allocation must sum to 100%.
4.  **Specific Recommendations:** Provide a list of 3-5 concrete, actionable recommendations. For each recommendation, you MUST provide a ticker, a name, and a justification. For stocks, mention specific promising companies in the Gulf region (e.g., ticker: ARAMCO, name: أرامكو السعودية). For real estate, suggest general markets as there are no tickers (e.g., ticker: REAL-DUBAI, name: عقارات سكنية في دبي). For gold and other commodities, suggest common ETFs (e.g., ticker: GLD, name: SPDR Gold Shares). For user-specified categories, provide creative and relevant suggestions even if they don't have traditional tickers (e.g., ticker: ART-MODERN, name: فن حديث).
5.  **Risk Analysis:** Briefly describe the potential risks associated with this strategy and how they align with the user's stated risk tolerance.

Ensure all financial advice is high-level and for informational purposes. The entire output, including all field names and text, MUST be in ARABIC.
`;

    const {stream, response} = ai.generate({
      prompt: promptText,
      output: { schema: InvestmentStrategyOutputSchema },
      stream: true,
    });
    return {stream, response};
  }
);
