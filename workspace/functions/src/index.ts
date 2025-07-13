
/**
 * @fileOverview Main Firebase Functions entry point for the stock tracker.
 */
import { config } from "dotenv";
config(); // Load environment variables from .env file

import {initializeApp} from "firebase-admin/app";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {updateAllMarketPrices} from "./lib/stock-updater";
import {logError} from "./lib/error-logger";
import {defineString} from "firebase-functions/params";
import { init } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase";


// Initialize the Firebase Admin SDK.
initializeApp();

// Initialize Genkit with Firebase and Google AI plugins
init({
  plugins: [
    firebase(),
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  logSinks: [],
  enableTracing: false,
});


// Define environment variables for the function.
defineString("GEMINI_API_KEY");
defineString("FIRECRAWL_API_KEY");


// Define a scheduled function that runs every 24 hours.
export const updateStockPrices = onSchedule("every 24 hours", async (event) => {
  console.log("Scheduled stock price update function triggered.");
  try {
    await updateAllMarketPrices();
    console.log("Stock price update completed successfully.");
    return null;
  } catch (error) {
    console.error("Critical error in scheduled stock price update:", error);
    await logError(
        "updateStockPrices-critical",
        error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
});

/**
 * A manually callable function to trigger the price update process immediately.
 * This is useful for one-off updates or testing.
 */
export const runPriceUpdateNow = onCall({enforceAppCheck: false}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    console.log(`Manual price update triggered by user: ${request.auth.uid}`);
    try {
        await updateAllMarketPrices();
        const successMessage = "Manual stock price update completed successfully.";
        console.log(successMessage);
        return {status: "success", message: successMessage};
    } catch (error) {
        console.error("Critical error in manual stock price update:", error);
        // Throw an HttpsError to send a structured error back to the client.
        throw new HttpsError("internal", "An internal error occurred while updating prices.", error);
    }
});
