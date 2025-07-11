/**
 * @fileOverview Genkit configuration for Firebase Functions.
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
