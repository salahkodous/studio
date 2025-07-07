import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { getFirebase } from "./firebase";
import type { InvestmentStrategyOutput } from "@/ai/schemas/investment-strategy-schema";

/**
 * Retrieves the user's watchlist from Firestore.
 * If the user document does not exist, it creates one with an empty watchlist.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of stock tickers.
 */
export async function getWatchlist(userId: string): Promise<string[]> {
    const firebase = getFirebase();
    if (!firebase) return [];

    const userDocRef = doc(firebase.db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.watchlist || [];
    } else {
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
    const firebase = getFirebase();
    if (!firebase) return;

    const userDocRef = doc(firebase.db, "users", userId);
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
    const firebase = getFirebase();
    if (!firebase) return;

    const userDocRef = doc(firebase.db, "users", userId);
    await updateDoc(userDocRef, {
        watchlist: arrayRemove(ticker)
    });
}

/**
 * Saves a generated investment strategy to the user's account.
 * @param userId - The ID of the user.
 * @param strategy - The investment strategy object to save.
 */
export async function saveStrategy(userId: string, strategy: InvestmentStrategyOutput) {
    const firebase = getFirebase();
    if (!firebase) return;

    const strategiesCollectionRef = collection(firebase.db, "users", userId, "strategies");
    await addDoc(strategiesCollectionRef, {
        ...strategy,
        createdAt: new Date(),
    });
}

/**
 * Retrieves all saved investment strategies for a user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of saved strategy objects.
 */
export async function getStrategies(userId: string): Promise<(InvestmentStrategyOutput & { id: string; createdAt: Date })[]> {
    const firebase = getFirebase();
    if (!firebase) return [];
    
    const strategiesCollectionRef = collection(firebase.db, "users", userId, "strategies");
    const q = query(strategiesCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as InvestmentStrategyOutput & { id: string; createdAt: Date };
    });
}
