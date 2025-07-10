'use server';
/**
 * @fileOverview An AI tool to get real estate price information.
 * 
 * - getRealEstatePrice - A Genkit tool that simulates fetching the average price per square meter for a given city.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { realEstateData } from '@/lib/data';

const realEstateCityKeys = realEstateData.map(c => c.cityKey.toLowerCase());

export const getRealEstatePrice = ai.defineTool(
  {
    name: 'getRealEstatePrice',
    description: 'Gets the current average price per square meter for residential real estate in a major Gulf city. Use this tool if the user expresses interest in real estate investment.',
    inputSchema: z.object({
      city: z.string().describe(`The city to get the real estate price for. Must be a major city in the GCC, e.g., ${realEstateCityKeys.join(', ')}.`).toLowerCase(),
    }),
    outputSchema: z.object({
        pricePerSqM: z.number().describe('The average price per square meter.'),
        currency: z.string().describe('The currency of the price (e.g., SAR, AED, QAR).'),
    }),
  },
  async (input) => {
    console.log(`[getRealEstatePrice] AI Agent is looking up price for: ${input.city}`);
    
    const cityInfo = realEstateData.find(c => c.cityKey.toLowerCase() === input.city.toLowerCase());

    if (cityInfo) {
        // Simulate some minor market fluctuation
        const simulatedPrice = cityInfo.pricePerSqM * (1 + (Math.random() - 0.5) * 0.05); // +/- 2.5% fluctuation
        return {
            pricePerSqM: Math.round(simulatedPrice),
            currency: cityInfo.currency,
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
