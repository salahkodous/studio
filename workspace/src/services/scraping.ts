/**
 * @fileOverview A service for scraping web content using Firecrawl.
 */
'use server';

import FirecrawlApp from '@firecrawl/sdk';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

/**
 * Scrapes a URL for its main content using Firecrawl.
 * @param url The URL to scrape.
 * @returns The scraped data, including markdown and metadata.
 */
export async function scrapeUrl(url: string) {
  if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY.length < 5) {
      console.error("[Firecrawl] API key is missing or invalid.");
      throw new Error("Firecrawl API key not configured.");
  }
  
  console.log(`[Scraping Service] Scraping URL: ${url}`);
  try {
    const scrapedData = await firecrawl.scrapeUrl(url, {
        pageOptions: {
            // Tell Firecrawl to only get the main content, ignore headers, footers, etc.
            onlyMainContent: true
        }
    });
    return scrapedData;
  } catch (error) {
    console.error(`[Scraping Service] Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape URL: ${url}`);
  }
}
