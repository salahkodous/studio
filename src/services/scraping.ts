/**
 * @fileOverview A service for scraping web content using Firecrawl.
 */
'use server';

import FirecrawlApp from '@mendable/firecrawl-js';

/**
 * Scrapes a URL for its main content using Firecrawl.
 * @param url The URL to scrape.
 * @returns The scraped data, including markdown and metadata.
 */
export async function scrapeUrl(url: string) {
  // Read the API key from environment variables.
  // Server-side code can access variables without the NEXT_PUBLIC_ prefix.
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || apiKey.length < 5) {
      console.error("[Firecrawl] API key is missing or invalid in .env file.");
      throw new Error("Firecrawl API key not configured. Please add your FIRECRAWL_API_KEY to the .env file.");
  }
  
  const firecrawl = new FirecrawlApp({ apiKey });
  
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
