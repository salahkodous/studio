'use server';
/**
 * @fileOverview Generates an investment strategy based on user inputs.
 *
 * - generateInvestmentStrategy - A function that creates a personalized investment plan.
 */

import {ai} from '@/ai/genkit';
import {
  type InvestmentStrategyInput,
  InvestmentStrategyInputSchema,
  type InvestmentStrategyOutput,
  InvestmentStrategyOutputSchema,
} from '@/ai/schemas/investment-strategy-schema';

export async function generateInvestmentStrategy(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  return investmentStrategyFlow(input);
}

const investmentStrategyPrompt = ai.definePrompt({
  name: 'investmentStrategyPrompt',
  input: {schema: InvestmentStrategyInputSchema},
  output: {schema: InvestmentStrategyOutputSchema},
  prompt: `You are an expert financial advisor specializing in investment opportunities within the GCC (Gulf Cooperation Council) countries. Your task is to create a personalized investment strategy for a client based on their profile. The output MUST be in Arabic.

Client Profile:
- Investment Capital: $\{${'{{capital}}'}\} USD
- Interested Asset Categories: {{#each categories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if otherCategory}}
- Other Interests: {{{otherCategory}}}
{{/if}}
- Risk Tolerance: {{{riskLevel}}}
- Investment Goals: {{{investmentGoals}}}

Based on this profile, generate a comprehensive and actionable investment strategy. If the user specified an "Other" category, be sure to include analysis and recommendations for that specific interest.

Your response should include:
1.  **Strategy Title:** A clear and concise title for the strategy.
2.  **Strategy Summary:** A paragraph summarizing the overall approach, tailored to the client's risk level and goals.
3.  **Asset Allocation:** A breakdown of how the capital should be allocated across the selected categories. Provide a percentage and a short rationale for each allocation. The total allocation must sum to 100%.
4.  **Specific Recommendations:** Provide a list of 3-5 concrete, actionable recommendations. For each recommendation, you MUST provide a ticker, a name, and a justification. For stocks, mention specific promising companies in the Gulf region (e.g., ticker: ARAMCO, name: أرامكو السعودية). For real estate, suggest general markets as there are no tickers (e.g., ticker: REAL-DUBAI, name: عقارات سكنية في دبي). For gold and other commodities, suggest common ETFs (e.g., ticker: GLD, name: SPDR Gold Shares). For "Other" user-specified categories, provide creative and relevant suggestions even if they don't have traditional tickers (e.g., ticker: ART-MODERN, name: فن حديث).
5.  **Risk Analysis:** Briefly describe the potential risks associated with this strategy and how they align with the user's stated risk tolerance.

Ensure all financial advice is high-level and for informational purposes. The entire output, including all field names and text, MUST be in ARABIC.
`,
});

const investmentStrategyFlow = ai.defineFlow(
  {
    name: 'investmentStrategyFlow',
    inputSchema: InvestmentStrategyInputSchema,
    outputSchema: InvestmentStrategyOutputSchema,
  },
  async input => {
    const {output} = await investmentStrategyPrompt(input);
    return output!;
  }
);
