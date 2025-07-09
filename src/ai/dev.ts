import { config } from 'dotenv';
config();

import '@/ai/flows/generate-investment-strategy.ts';
import '@/ai/flows/summarize-stock-news.ts';
import '@/ai/flows/stream-investment-strategy.ts';
