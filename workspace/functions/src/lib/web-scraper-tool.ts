
'use server';
/**
 * @fileOverview An AI tool to scrape website content.
 * - webScraperTool: A Genkit tool that uses Firecrawl to scrape a URL.
 */

import { ai } from "./genkit-config";
import { z } from 'genkit';
import FirecrawlApp from '@mendable/firecrawl-js';

export const webScraperTool = ai.defineTool(
  {
    name: 'webScraperTool',
    description: 'Scrapes a given URL and returns its main content in Markdown format. Use this to get information from specific web pages.',
    inputSchema: z.object({
      url: z.string().url().describe('The valid URL to be scraped.'),
    }),
    outputSchema: z.object({
        content: z.string().describe('The clean, main content of the page in Markdown format.'),
        title: z.string().describe('The title of the page.'),
    })
  },
  async ({ url }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey || apiKey.length < 5 || apiKey === 'YOUR_FIRECRAWL_API_KEY') {
        console.error("[Firecrawl] API key is missing or invalid.");
        throw new Error("Firecrawl API key not configured.");
    }
  
    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.scrapeUrl(url, {
        pageOptions: { onlyMainContent: true }
    });

    if (!result || !result.data || !result.data.markdown) {
        throw new Error(`Failed to scrape or extract markdown from ${url}`);
    }
    return {
        content: result.data.markdown,
        title: result.data.metadata.title,
    };
  }
);
