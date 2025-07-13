
import { doc, getDoc, setDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, type Unsubscribe, writeBatch, deleteDoc } from "firebase/firestore";
import { db as firestoreDb } from "./firebase"; // Import the initialized instance
import type { InvestmentStrategyOutput } from "@/ai/schemas/investment-strategy-schema";

export type SavedStrategy = InvestmentStrategyOutput & {
  id: string
  createdAt: Date // Standardized to always be a Date object
}

export interface PortfolioDetails {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface PortfolioAsset {
  id: string
  name: string
  name_ar: string
  ticker: string | null;
  category: string;
  purchasePrice: number
  quantity: number | null
}


// --- WATCHLIST FUNCTIONS ---

/**
 * Sets up a real-time listener for the user's watchlist.
 * @param userId The ID of the user.
 * @param callback The function to call with the updated watchlist.
 * @returns An unsubscribe function to detach the listener.
 */
export function onWatchlistUpdate(userId: string, callback: (watchlist: string[]) => void): Unsubscribe | undefined {
    if (!firestoreDb) {
        console.error("Firestore is not initialized.");
        callback([]);
        return;
    }

    const userDocRef = doc(firestoreDb, "users", userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().watchlist || []);
        } else {
            callback([]);
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
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const userDocRef = doc(firestoreDb, "users", userId);
    await setDoc(userDocRef, {
        watchlist: arrayUnion(ticker)
    }, { merge: true });
}

/**
 * Removes a stock ticker from the user's watchlist.
 * @param userId - The ID of the user.
 * @param ticker - The stock ticker to remove.
 */
export async function removeFromWatchlist(userId: string, ticker: string) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const userDocRef = doc(firestoreDb, "users", userId);
    await setDoc(userDocRef, {
        watchlist: arrayRemove(ticker)
    }, { merge: true });
}


// --- PORTFOLIO FUNCTIONS ---

/**
 * Creates a new, empty portfolio for the user.
 * It also ensures the parent user document exists before creating the portfolio.
 * @param userId - The ID of the user.
 * @param name - The name of the new portfolio.
 */
export async function createPortfolio(userId: string, name: string) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    // Ensure the parent user document exists. This is crucial.
    // Using set with merge:true is a safe way to create if it doesn't exist, or do nothing if it does.
    const userDocRef = doc(firestoreDb, "users", userId);
    await setDoc(userDocRef, {}, { merge: true });

    const portfoliosColRef = collection(userDocRef, "portfolios");
    await addDoc(portfoliosColRef, {
        name: name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
}


/**
 * Deletes a portfolio and all its assets.
 * @param userId The ID of the user.
 * @param portfolioId The ID of the portfolio to delete.
 */
export async function deletePortfolio(userId: string, portfolioId: string) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const portfolioDocRef = doc(firestoreDb, "users", userId, "portfolios", portfolioId);
    
    // Optional: Delete all assets in the subcollection first
    const assetsColRef = collection(portfolioDocRef, "assets");
    const assetsSnapshot = await getDocs(assetsColRef);
    const batch = writeBatch(firestoreDb);
    assetsSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Delete the portfolio document itself
    await deleteDoc(portfolioDocRef);
}


/**
 * Sets up a real-time listener for the user's portfolios.
 * @param userId The ID of the user.
 * @param callback The function to call with the updated portfolio list.
 * @returns An unsubscribe function to detach the listener.
 */
export function onPortfoliosUpdate(userId: string, callback: (portfolios: PortfolioDetails[]) => void): Unsubscribe | undefined {
    if (!firestoreDb) {
        console.error("Firestore is not initialized.");
        callback([]);
        return;
    }
    const portfoliosColRef = collection(firestoreDb, "users", userId, "portfolios");
    const q = query(portfoliosColRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const portfolios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PortfolioDetails));
        callback(portfolios);
    }, (error) => {
        console.error("Error listening to portfolios:", error);
        callback([]);
    });

    return unsubscribe;
}

/**
 * Gets details for a single portfolio.
 * @param userId The user ID.
 * @param portfolioId The portfolio ID.
 * @returns PortfolioDetails or null if not found.
 */
export async function getPortfolio(userId: string, portfolioId: string): Promise<PortfolioDetails | null> {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const docRef = doc(firestoreDb, "users", userId, "portfolios", portfolioId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PortfolioDetails;
    } else {
        return null;
    }
}


/**
 * Sets up a real-time listener for the assets within a specific portfolio.
 * @param userId The ID of the user.
 * @param portfolioId The ID of the portfolio.
 * @param callback The function to call with the updated assets.
 * @returns An unsubscribe function to detach the listener.
 */
export function onPortfolioAssetsUpdate(userId: string, portfolioId: string, callback: (assets: PortfolioAsset[]) => void): Unsubscribe | undefined {
    if (!firestoreDb) {
        console.error("Firestore is not initialized.");
        callback([]);
        return;
    }
    const assetsColRef = collection(firestoreDb, "users", userId, "portfolios", portfolioId, "assets");
    
    const unsubscribe = onSnapshot(assetsColRef, (snapshot) => {
        const assets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            ticker: doc.data().ticker || null, // Ensure ticker exists
        } as PortfolioAsset));
        callback(assets);
    }, (error) => {
        console.error("Error listening to portfolio assets:", error);
        callback([]);
    });

    return unsubscribe;
}

/**
 * Adds a new asset to a specific portfolio.
 * @param userId The ID of the user.
 * @param portfolioId The ID of the portfolio.
 * @param asset The asset data to add.
 */
export async function addAssetToPortfolio(userId: string, portfolioId: string, asset: Omit<PortfolioAsset, 'id'>) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const assetsColRef = collection(firestoreDb, "users", userId, "portfolios", portfolioId, "assets");
    await addDoc(assetsColRef, asset);
    
    // Update the portfolio's updatedAt timestamp
    const portfolioDocRef = doc(firestoreDb, "users", userId, "portfolios", portfolioId);
    await setDoc(portfolioDocRef, { updatedAt: Date.now() }, { merge: true });
}

/**
 * Removes an asset from a specific portfolio.
 * @param userId The ID of the user.
 * @param portfolioId The ID of the portfolio.
 * @param assetId The ID of the asset document to remove.
 */
export async function removeAssetFromPortfolio(userId: string, portfolioId: string, assetId: string) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const assetDocRef = doc(firestoreDb, "users", userId, "portfolios", portfolioId, "assets", assetId);
    await deleteDoc(assetDocRef);

    // Update the portfolio's updatedAt timestamp
    const portfolioDocRef = doc(firestoreDb, "users", userId, "portfolios", portfolioId);
    await setDoc(portfolioDocRef, { updatedAt: Date.now() }, { merge: true });
}

// --- STRATEGY FUNCTIONS ---

/**
 * Saves a generated investment strategy to the user's account.
 * @param userId - The ID of the user.
 * @param strategy - The investment strategy object to save.
 */
export async function saveStrategy(userId: string, strategy: InvestmentStrategyOutput) {
    if (!firestoreDb) throw new Error("Firestore is not initialized.");

    const strategiesCollectionRef = collection(firestoreDb, "users", userId, "strategies");
    await addDoc(strategiesCollectionRef, {
        ...strategy,
        createdAt: Timestamp.fromDate(new Date()), // Store as a Firestore Timestamp
    });
}

/**
 * Sets up a real-time listener for the user's strategies.
 * @param userId The ID of the user.
 * @param callback The function to call with the updated strategies.
 * @returns An unsubscribe function to detach the listener.
 */
export function onStrategiesUpdate(userId: string, callback: (strategies: SavedStrategy[]) => void): Unsubscribe | undefined {
    if (!firestoreDb) {
        console.error("Firestore is not initialized.");
        callback([]);
        return;
    }

    const strategiesCollectionRef = collection(firestoreDb, "users", userId, "strategies");
    const q = query(strategiesCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const strategies = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to JavaScript Date object
            const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date();
            return {
                id: doc.id,
                ...data,
                createdAt: createdAt,
            } as SavedStrategy;
        });
        callback(strategies);
    }, (error) => {
        console.error("Error listening to strategies:", error);
        callback([]);
    });

    return unsubscribe;
}
