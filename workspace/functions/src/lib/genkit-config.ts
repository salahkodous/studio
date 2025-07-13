/**
 * @fileOverview Genkit configuration for Firebase Functions.
 * This file is not currently used by the stock-updater but is kept for other potential AI features.
 */
import {genkit} from "genkit";
import {googleAI} from "@genkit-ai/googleai";
import {firebase} from "@genkit-ai/firebase";

export const ai = genkit({
  plugins: [
    firebase(), // Integrates with Firebase Functions environment
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  logSinks: [], // Disable default logging in production for cleaner logs
  enableTracing: false,
});
