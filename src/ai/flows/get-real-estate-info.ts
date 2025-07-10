'use server';
/**
 * @fileOverview An AI tool to get real estate price information.
 * 
 * - getRealEstatePrice - A Genkit tool that simulates fetching the average price per square meter for a given city.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const realEstateData: Record<string, { pricePerSqM: number; currency: string }> = {
    'riyadh': { pricePerSqM: 4500, currency: 'SAR' },
    'jeddah': { pricePerSqM: 3800, currency: 'SAR' },
    'dubai': { pricePerSqM: 12000, currency: 'AED' },
    'abudhabi': { pricePerSqM: 10500, currency: 'AED' },
    'doha': { pricePerSqM: 15000, currency: 'QAR' },
};

export const getRealEstatePrice = ai.defineTool(
  {
    name: 'getRealEstatePrice',
    description: 'Gets the current average price per square meter for residential real estate in a major Gulf city. Use this tool if the user expresses interest in real estate investment.',
    inputSchema: z.object({
      city: z.string().describe('The city to get the real estate price for. Must be a major city in the GCC, e.g., "Dubai", "Riyadh", "Doha".').toLowerCase(),
    }),
    outputSchema: z.object({
        pricePerSqM: z.number().describe('The average price per square meter.'),
        currency: z.string().describe('The currency of the price (e.g., SAR, AED, QAR).'),
    }),
  },
  async (input) => {
    console.log(`[getRealEstatePrice] Looking up price for: ${input.city}`);
    
    const cityData = realEstateData[input.city.toLowerCase()];

    if (cityData) {
        // Simulate some minor market fluctuation
        const simulatedPrice = cityData.pricePerSqM * (1 + (Math.random() - 0.5) * 0.05); // +/- 2.5% fluctuation
        return {
            pricePerSqM: Math.round(simulatedPrice),
            currency: cityData.currency,
        };
    } else {
        // Return a default/estimated value if the city is not in our mock data
        return {
            pricePerSqM: 8000,
            currency: 'USD'
        };
    }
  }
);
