// This is a new file for the market analysis schema
/**
 * @fileOverview Defines the data schemas and types for the market analysis AI feature.
 *
 * - MarketAnalysisInputSchema - Zod schema for the input.
 * - MarketAnalysisSchema - Zod schema for the output.
 * - MarketAnalysis - The TypeScript type for the output.
 */

import { z } from 'genkit';

export const MarketAnalysisInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock to be analyzed.'),
});

const RecommendationSchema = z.object({
  decision: z.enum(['Buy', 'Sell', 'Hold']).describe('The final recommendation: Buy, Sell, or Hold.'),
  confidenceScore: z.number().min(1).max(10).describe('A confidence score for the recommendation, from 1 to 10.'),
  justification: z.string().describe('A brief justification for the recommendation.'),
});

export const MarketAnalysisSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the analyzed stock.'),
  companyName: z.string().describe('The name of the company.'),
  financialAnalysis: z.string().describe('A summary of the financial analysis based on current price and trends.'),
  newsSummary: z.string().describe('A summary of the recent news and its potential impact.'),
  recommendation: RecommendationSchema.describe('The final investment recommendation.'),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
