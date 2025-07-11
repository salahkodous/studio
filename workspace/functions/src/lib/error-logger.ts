/**
 * @fileOverview Service for logging errors to Firestore.
 */
import {getFirestore, Timestamp} from "firebase-admin/firestore";

// No need to initializeApp here, it's done in the entry point.
const db = getFirestore();

/**
 * Logs an error object to the `/errors` collection in Firestore.
 * @param source A string identifying the source of the error (e.g., function name).
 * @param error The error object to log.
 */
export async function logError(source: string, error: Error): Promise<void> {
  try {
    const errorsCollection = db.collection("errors");
    await errorsCollection.add({
      source: source,
      message: error.message,
      stack: error.stack,
      timestamp: Timestamp.now(),
    });
  } catch (dbError) {
    // If logging to Firestore fails, log to the console as a last resort.
    console.error(`Failed to log error to Firestore. Source: ${source}`, error);
    console.error("Firestore logging error:", dbError);
  }
}
