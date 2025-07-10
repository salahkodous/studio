
/**
 * @fileOverview Defines the data schemas and types for the investment strategy generation feature.
 *
 * - InvestmentStrategyInputSchema - Zod schema for the input of the investment strategy generator.
 * - InvestmentStrategyInput - The TypeScript type for the input.
 * - InvestmentStrategyOutputSchema - Zod schema for the output of the investment strategy generator.
 * - InvestmentStrategyOutput - The TypeScript type for the output.
 */

import {z} from 'genkit';

export const InvestmentStrategyInputSchema = z.object({
  capital: z.number().min(1000).describe('The amount of capital to invest, in USD.'),
  categories: z.array(z.string()).min(1).describe('The asset categories the user is interested in (e.g., Stocks, Gold, Real Estate, Vintage Cars). This can include standard and user-defined categories.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe("The user's risk tolerance."),
  investmentGoals: z.string().describe("The user's financial goals or expected payoff."),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const AssetAllocationSchema = z.object({
    category: z.string().describe('The asset class, for example "Stocks" or "Real Estate".'),
    percentage: z.number().describe('The percentage of capital allocated to this asset class.'),
    rationale: z.string().describe('A brief rationale for this allocation percentage.'),
});

const RecommendationSchema = z.object({
    ticker: z.string().describe('The ticker symbol for the recommended asset (e.g., ARAMCO, GLD).'),
    name: z.string().describe('The name of the recommended asset (e.g., Saudi Aramco, SPDR Gold Shares).'),
    justification: z.string().describe('A brief justification for why this specific asset is recommended.'),
});

export const InvestmentStrategyOutputSchema = z.object({
  strategyTitle: z.string().describe("A catchy title for the proposed investment strategy in Arabic."),
  strategySummary: z.string().describe('A summary of the investment strategy in Arabic.'),
  assetAllocation: z.array(AssetAllocationSchema).describe('An array of asset allocations with percentages and rationales.'),
  recommendations: z.array(RecommendationSchema).describe('A list of specific, actionable asset recommendations with their tickers, names, and justifications, in Arabic.'),
  riskAnalysis: z.string().describe("An analysis of the risks associated with this strategy in Arabic."),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;

    
