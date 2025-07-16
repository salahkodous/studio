/**
 * @fileoverview Service for fetching stock data from Firestore.
 * This centralizes data access for stocks, ensuring consistency.
 */
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Asset } from './data';
import { unstable_cache as cache } from 'next/cache';

// Re-export the Asset type for convenience in other files
export type { Asset } from './data';


/**
 * Fetches all documents from the 'saudi_stocks' collection.
 * This function is cached to prevent excessive Firestore reads on page loads.
 * The cache is tagged 'stocks' so it can be revalidated.
 */
export const getAllStocks = cache(
  async (): Promise<Asset[]> => {
    console.log('[stocks.ts] Fetching all stocks from Firestore...');
    try {
      const stocksCollectionRef = collection(db, 'saudi_stocks');
      const snapshot = await getDocs(stocksCollectionRef);
      if (snapshot.empty) {
        console.log('[stocks.ts] No stocks found in saudi_stocks collection.');
        return [];
      }
      const stocks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ticker: doc.id,
          name: data.name || 'Unknown Name',
          name_ar: data.name_ar || 'اسم غير معروف',
          price: data.price || 0,
          change: data.change || '0.00',
          changePercent: data.changePercent || '0.00%',
          trend: data.trend || 'stable',
          currency: data.currency || 'SAR',
          category: 'Stocks', // Assuming all in this collection are stocks
          country: 'SA', // Assuming all in this collection are from SA for now
        } as Asset;
      });
      return stocks;
    } catch (error) {
      console.error("[stocks.ts] Error fetching all stocks: ", error);
      return []; // Return empty array on error
    }
  },
  ['all-stocks'], // Cache key parts
  { tags: ['stocks'], revalidate: 3600 } // Revalidate every hour
);


/**
 * Fetches a single stock document by its ticker (document ID).
 * This function is also cached.
 * @param ticker The stock ticker (document ID) to fetch.
 * @returns The Asset object or null if not found.
 */
export const getStockByTicker = cache(
    async (ticker: string): Promise<Asset | null> => {
        if (!ticker) return null;
        console.log(`[stocks.ts] Fetching stock by ticker from Firestore: ${ticker}`);
        try {
            const stockDocRef = doc(db, 'saudi_stocks', ticker.toUpperCase());
            const docSnap = await getDoc(stockDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    ticker: docSnap.id,
                    name: data.name || 'Unknown Name',
                    name_ar: data.name_ar || 'اسم غير معروف',
                    price: data.price || 0,
                    change: data.change || '0.00',
                    changePercent: data.changePercent || '0.00%',
                    trend: data.trend || 'stable',
                    currency: data.currency || 'SAR',
                    category: 'Stocks',
                    country: 'SA',
                } as Asset;
            } else {
                console.warn(`[stocks.ts] No stock found for ticker: ${ticker}`);
                return null;
            }
        } catch (error) {
            console.error(`[stocks.ts] Error fetching stock by ticker ${ticker}:`, error);
            return null; // Return null on error
        }
    },
    ['single-stock'], // Cache key parts
    { tags: ['stocks'], revalidate: 3600 } // Revalidate every hour
);