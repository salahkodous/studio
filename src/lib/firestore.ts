import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import type { InvestmentStrategyOutput } from "@/ai/schemas/investment-strategy-schema";

export type SavedStrategy = InvestmentStrategyOutput & {
  id: string
  createdAt: Date
}

/**
 * Retrieves the user's watchlist from Firestore.
 * If the user document does not exist, it creates one with an empty watchlist.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of stock tickers.
 */
export async function getWatchlist(userId: string): Promise<string[]> {
    const db = getFirestoreDb();
    if (!db) return [];

    const userDocRef = doc(db, "users", userId);
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
 * Sets up a real-time listener for the user's watchlist.
 * @param userId The ID of the user.
 * @param callback The function to call with the updated watchlist.
 * @returns An unsubscribe function to detach the listener.
 */
export function onWatchlistUpdate(userId: string, callback: (watchlist: string[]) => void): Unsubscribe | undefined {
    const db = getFirestoreDb();
    if (!db) {
        callback([]);
        return;
    }

    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().watchlist || []);
        } else {
            setDoc(userDocRef, { watchlist: [] });
        }
    }, (error) => {
        console.error("Error listening to watchlist:", error);
        callback([]);
    });

    return unsubscribe;
}


/**
 * Adds a stock ticker to the user's watchlist.
 * @param userId - The ID of the user.
 * @param ticker - The stock ticker to add.
 */
export async function addToWatchlist(userId: string, ticker: string) {
    const db = getFirestoreDb();
    if (!db) return;

    const userDocRef = doc(db, "users", userId);
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
    const db = getFirestoreDb();
    if (!db) return;

    const userDocRef = doc(db, "users", userId);
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
    const db = getFirestoreDb();
    if (!db) return;

    const strategiesCollectionRef = collection(db, "users", userId, "strategies");
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
export async function getStrategies(userId: string): Promise<SavedStrategy[]> {
    const db = getFirestoreDb();
    if (!db) return [];
    
    const strategiesCollectionRef = collection(db, "users", userId, "strategies");
    const q = query(strategiesCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as SavedStrategy;
    });
}


/**
 * Sets up a real-time listener for the user's strategies.
 * @param userId The ID of the user.
 * @param callback The function to call with the updated strategies.
 * @returns An unsubscribe function to detach the listener.
 */
export function onStrategiesUpdate(userId: string, callback: (strategies: SavedStrategy[]) => void): Unsubscribe | undefined {
    const db = getFirestoreDb();
    if (!db) {
        callback([]);
        return;
    }

    const strategiesCollectionRef = collection(db, "users", userId, "strategies");
    const q = query(strategiesCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const strategies = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as SavedStrategy;
        });
        callback(strategies);
    }, (error) => {
        console.error("Error listening to strategies:", error);
        callback([]);
    });

    return unsubscribe;
}