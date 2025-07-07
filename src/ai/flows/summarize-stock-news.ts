'use server';
/**
 * @fileOverview Summarizes news articles for a given stock ticker.
 *
 * - summarizeNews - A function that takes a stock ticker and returns a summary of recent news.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {newsArticles} from '@/lib/data';

const SummarizeNewsInputSchema = z.object({
  ticker: z.string().describe('The stock ticker to summarize news for (e.g., ARAMCO).'),
});

const SummarizeNewsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the news articles in Arabic.'),
});

export async function summarizeNews(input: z.infer<typeof SummarizeNewsInputSchema>): Promise<z.infer<typeof SummarizeNewsOutputSchema>> {
  return summarizeNewsFlow(input);
}

const summarizeNewsPrompt = ai.definePrompt({
    name: 'summarizeStockNewsPrompt',
    input: {schema: z.object({ ticker: z.string(), articles: z.array(z.string()) })},
    output: {schema: SummarizeNewsOutputSchema},
    prompt: `أنت محلل مالي خبير. مهمتك هي تلخيص الأخبار المتعلقة بسهم معين وتقديم النقاط الرئيسية التي قد تؤثر على أداء السهم.

سهم: {{{ticker}}}
روابط المقالات الإخبارية:
{{#each articles}}
- {{{this}}}
{{/each}}

قم بتحليل هذه الأخبار وقدم ملخصًا موجزًا باللغة العربية. يجب أن يكون الملخص سهل الفهم للمستثمر العادي. ركز على التأثيرات المحتملة (الإيجابية أو السلبية) على الشركة وسعر سهمها.
`,
});

const summarizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async ({ ticker }) => {
    const articles = newsArticles[ticker] || [];
    
    if (articles.length === 0) {
        return { summary: 'لا توجد أخبار متاحة لهذا السهم.' };
    }

    const {output} = await summarizeNewsPrompt({ ticker, articles });
    return output!;
  }
);
