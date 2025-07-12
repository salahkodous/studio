
/**
 * @fileOverview Main Firebase Functions entry point for the stock tracker.
 */
import {onSchedule} from "firebase-functions/v2/scheduler";
import {updateAllMarketPrices} from "./lib/stock-updater";
import {logError} from "./lib/error-logger";
import {defineString} from "firebase-functions/params";

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
