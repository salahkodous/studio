'use server';
/**
 * @fileOverview Generates an investment strategy based on user inputs.
 *
 * - generateInvestmentStrategy - A function that creates a personalized investment plan.
 * - InvestmentStrategyInput - The input type for the generateInvestmentStrategy function.
 * - InvestmentStrategyOutput - The return type for the generateInvestmentStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const InvestmentStrategyInputSchema = z.object({
  capital: z.number().min(1000).describe('The amount of capital to invest, in USD.'),
  categories: z.array(z.string()).min(1).describe('The asset categories the user is interested in (e.g., Stocks, Gold, Real Estate).'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe("The user's risk tolerance."),
  investmentGoals: z.string().describe("The user's financial goals or expected payoff."),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const AssetAllocationSchema = z.object({
    category: z.string().describe('The asset class, for example "Stocks" or "Real Estate".'),
    percentage: z.number().describe('The percentage of capital allocated to this asset class.'),
    rationale: z.string().describe('A brief rationale for this allocation percentage.'),
});

export const InvestmentStrategyOutputSchema = z.object({
  strategyTitle: z.string().describe("A catchy title for the proposed investment strategy in Arabic."),
  strategySummary: z.string().describe('A summary of the investment strategy in Arabic.'),
  assetAllocation: z.array(AssetAllocationSchema).describe('An array of asset allocations with percentages and rationales.'),
  recommendations: z.array(z.string()).describe('A list of specific, actionable recommendations in Arabic (e.g., "Consider investing in Saudi Aramco stocks" or "Look into REITs in Dubai").'),
  riskAnalysis: z.string().describe("An analysis of the risks associated with this strategy in Arabic."),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;


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
- Risk Tolerance: {{{riskLevel}}}
- Investment Goals: {{{investmentGoals}}}

Based on this profile, generate a comprehensive and actionable investment strategy.

Your response should include:
1.  **Strategy Title:** A clear and concise title for the strategy.
2.  **Strategy Summary:** A paragraph summarizing the overall approach, tailored to the client's risk level and goals.
3.  **Asset Allocation:** A breakdown of how the capital should be allocated across the selected categories. Provide a percentage and a short rationale for each allocation. The total allocation must sum to 100%.
4.  **Specific Recommendations:** Provide a list of 3-5 concrete, actionable recommendations. For stocks, mention specific promising companies in the Gulf region (e.g., Aramco, SABIC, QNB). For real estate, suggest types of properties or specific markets (e.g., residential apartments in Dubai, commercial properties in Riyadh). For gold and commodities, suggest investment methods (e.g., ETFs, physical gold).
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
