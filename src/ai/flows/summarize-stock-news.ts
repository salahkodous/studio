'use server';
/**
 * @fileOverview Summarizes stock news articles for a given stock ticker.
 *
 * - summarizeStockNews - A function that summarizes news articles for a given stock ticker.
 * - SummarizeStockNewsInput - The input type for the summarizeStockNews function.
 * - SummarizeStockNewsOutput - The return type for the summarizeStockNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStockNewsInputSchema = z.object({
  ticker: z.string().describe('The stock ticker to summarize news for.'),
  newsArticles: z.array(z.string()).describe('An array of news article URLs to summarize.'),
});
export type SummarizeStockNewsInput = z.infer<typeof SummarizeStockNewsInputSchema>;

const SummarizeStockNewsOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the news articles.'),
});
export type SummarizeStockNewsOutput = z.infer<typeof SummarizeStockNewsOutputSchema>;

export async function summarizeStockNews(input: SummarizeStockNewsInput): Promise<SummarizeStockNewsOutput> {
  return summarizeStockNewsFlow(input);
}

const summarizeStockNewsPrompt = ai.definePrompt({
  name: 'summarizeStockNewsPrompt',
  input: {schema: SummarizeStockNewsInputSchema},
  output: {schema: SummarizeStockNewsOutputSchema},
  prompt: `You are an expert financial analyst.

  Your job is to summarize news articles for a given stock ticker so that users can quickly understand the market trends without reading full articles.

  Stock Ticker: {{{ticker}}}
  News Articles: {{#each newsArticles}}{{{this}}}\n{{/each}}

  Please provide a concise summary of the news articles related to the given stock ticker in Arabic.
  `,
});

const summarizeStockNewsFlow = ai.defineFlow(
  {
    name: 'summarizeStockNewsFlow',
    inputSchema: SummarizeStockNewsInputSchema,
    outputSchema: SummarizeStockNewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeStockNewsPrompt(input);
    return output!;
  }
);
