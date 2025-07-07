import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Retrieves the user's watchlist from Firestore.
 * If the user document does not exist, it creates one with an empty watchlist.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of stock tickers.
 */
export async function getWatchlist(userId: string): Promise<string[]> {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.watchlist || [];
    } else {
        // If the user document doesn't exist, create it.
        // This can happen for users who signed up before Firestore was integrated.
        await setDoc(userDocRef, { watchlist: [] });
        return [];
    }
}

/**
 * Adds a stock ticker to the user's watchlist.
 * @param userId - The ID of the user.
 * @param ticker - The stock ticker to add.
 */
export async function addToWatchlist(userId: string, ticker: string) {
    const userDocRef = doc(db, "users", userId);
    // Use updateDoc with arrayUnion to add a new ticker to the watchlist array.
    // arrayUnion prevents duplicate entries.
    await updateDoc(userDocRef, {
        watchlist: arrayUnion(ticker)
    });
}

/**
 * Removes a stock ticker from the user's watchlist.
 * @param userId - The ID of the user.
 * @param ticker - The stock ticker to remove.
 */
export async function removeFromWatchlist(userId: string, ticker: string) {
    const userDocRef = doc(db, "users", userId);
    // Use updateDoc with arrayRemove to remove a ticker from the watchlist array.
    await updateDoc(userDocRef, {
        watchlist: arrayRemove(ticker)
    });
}
