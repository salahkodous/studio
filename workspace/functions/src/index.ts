/**
 * @fileOverview Main Firebase Functions entry point for the stock tracker.
 */
import {initializeApp} from "firebase-admin/app";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {updateAllMarketPrices} from "./lib/stock-updater";
import {logError} from "./lib/error-logger";
import {defineString} from "firebase-functions/params";

// Initialize the Firebase Admin SDK. Must be done once.
initializeApp();

// Define environment variables that must be set for the function to deploy.
// Use `firebase functions:secrets:set YOUR_SECRET_NAME` to set them.
defineString("FIRECRAWL_API_KEY");
defineString("GEMINI_API_KEY");


/**
 * A scheduled function that runs every 24 hours to update stock prices.
 */
export const updateStockPrices = onSchedule("every 24 hours", async (event) => {
  console.log("Scheduled stock price update function triggered.");
  try {
    const result = await updateAllMarketPrices();
    console.log(`Stock price update completed successfully. ${result.successCount} stocks updated.`);
    return null;
  } catch (error) {
    console.error("Critical error in scheduled stock price update:", error);
    await logError(
        "updateStockPrices-critical",
        error instanceof Error ? error : new Error(String(error)),
    );
    // Re-throwing the error is important for function monitoring
    throw error;
  }
});

/**
 * A manually callable function to trigger the price update process immediately.
 * This is useful for one-off updates or testing.
 */
export const runPriceUpdateNow = onCall({enforceAppCheck: false}, async (request) => {
    // Check for authentication
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    
    console.log(`Manual price update triggered by user: ${request.auth.uid}`);

    try {
        const result = await updateAllMarketPrices();
        const successMessage = `Manual stock price update completed successfully. ${result.successCount} stocks written.`;
        console.log(successMessage);
        return {status: "success", message: successMessage};
    } catch (error) {
        console.error("Critical error in manual stock price update:", error);
        // Throw an HttpsError to send a structured error back to the client.
        throw new HttpsError("internal", "An internal error occurred while updating prices.", {
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }
});
