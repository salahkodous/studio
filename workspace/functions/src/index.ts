
/**
 * @fileOverview Main Firebase Functions entry point for the stock tracker.
 */
import {initializeApp} from "firebase-admin/app";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {updateAllMarketPrices} from "./lib/stock-updater";
import {logError} from "./lib/error-logger";
import {defineString} from "firebase-functions/params";

// Initialize the Firebase Admin SDK.
// This is required for backend functions to interact with Firebase services.
initializeApp();

// Define environment variables for the function.
// These will be populated from .env.yaml when deploying.
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
    // Throwing an error here can allow for automatic retries if configured.
    throw error;
  }
});

/**
 * A manually callable function to trigger the price update process immediately.
 * This is useful for one-off updates or testing.
 */
export const runPriceUpdateNow = onCall({enforceAppCheck: false}, async (request) => {
    // Ensure the user is authenticated to prevent abuse.
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
        await logError(
            "runPriceUpdateNow-critical",
            error instanceof Error ? error : new Error(String(error)),
        );
        // Throw an HttpsError to send a structured error back to the client.
        throw new HttpsError("internal", "An internal error occurred while updating prices.", error);
    }
});
