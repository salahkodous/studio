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
 * Fetches all documents from the 'saudi_stocks' and 'uae_stocks' collections.
 * This function is cached to prevent excessive Firestore reads on page loads.
 * The cache is tagged 'stocks' so it can be revalidated.
 */
export const getAllStocks = cache(
  async (): Promise<Asset[]> => {
    console.log('[stocks.ts] Fetching all stocks from Firestore...');
    try {
      const saudiStocksRef = collection(db, 'saudi_stocks');
      const uaeStocksRef = collection(db, 'uae_stocks');

      const [saudiSnapshot, uaeSnapshot] = await Promise.all([
        getDocs(saudiStocksRef),
        getDocs(uaeStocksRef)
      ]);

      const saudiStocks = saudiSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ticker: doc.id,
          name: data.companyLongNameEn || data.name || 'Unknown Name',
          name_ar: data.companyLongNameAr || 'اسم غير معروف',
          price: data.price || 0,
          change: data.change || '0.00',
          changePercent: data.changePercent || '0.00%',
          trend: data.trend || 'stable',
          currency: data.currency || 'SAR',
          category: 'Stocks',
          country: 'SA',
        } as Asset;
      });
      
      const uaeStocks = uaeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ticker: doc.id,
          name: data.nameEn || 'Unknown Name',
          name_ar: data.nameAr || 'اسم غير معروف',
          price: data.price || 0,
          change: data.change || '0.00',
          changePercent: data.changePercent || '0.00%',
          trend: data.trend || 'stable',
          currency: data.currency || 'AED',
          category: 'Stocks',
          country: 'AE',
        } as Asset;
      });

      const allStocks = [...saudiStocks, ...uaeStocks];
      if (allStocks.length === 0) {
        console.log('[stocks.ts] No stocks found in any collection.');
      }
      return allStocks;

    } catch (error) {
      console.error("[stocks.ts] Error fetching all stocks: ", error);
      return []; // Return empty array on error
    }
  },
  ['all-stocks'], // Cache key parts
  { tags: ['stocks'], revalidate: 3600 } // Revalidate every hour
);

/**
 * Finds all stocks, optionally filtering by country.
 * This is an uncached, client-callable function.
 * @param filters - An object with optional filters, e.g., { country: 'SA' }.
 * @returns A promise that resolves to an array of Asset objects.
 */
export async function findAllStocks(filters?: { country: 'SA' | 'AE' | 'EG' }): Promise<Asset[]> {
    console.log(`[stocks.ts] Finding all stocks with filters:`, filters);
    try {
        if (!filters?.country) {
            return await getAllStocks();
        }

        const collectionName = filters.country === 'SA' ? 'saudi_stocks' : filters.country === 'AE' ? 'uae_stocks' : null;

        if (!collectionName) {
            console.warn(`[stocks.ts] No collection configured for country: ${filters.country}`);
            return [];
        }

        const q = query(collection(db, collectionName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`[stocks.ts] No stocks found for country: ${filters.country}`);
            return [];
        }

        return snapshot.docs.map(doc => {
            const data = doc.data();
            const isSaudi = filters.country === 'SA';
            return {
                ticker: doc.id,
                name: isSaudi ? (data.companyLongNameEn || data.name || 'Unknown Name') : (data.nameEn || 'Unknown Name'),
                name_ar: isSaudi ? (data.companyLongNameAr || 'اسم غير معروف') : (data.nameAr || 'اسم غير معروف'),
                price: data.price || 0,
                change: data.change || '0.00',
                changePercent: data.changePercent || '0.00%',
                trend: data.trend || 'stable',
                currency: data.currency || (isSaudi ? 'SAR' : 'AED'),
                category: 'Stocks',
                country: filters.country,
            } as Asset;
        });

    } catch (error) {
        console.error("[stocks.ts] Error in findAllStocks: ", error);
        return [];
    }
}


/**
 * Fetches a single stock document by its ticker (document ID).
 * This function is also cached. It will check Saudi stocks first, then UAE stocks.
 * @param ticker The stock ticker (document ID) to fetch.
 * @returns The Asset object or null if not found.
 */
export const getStockByTicker = cache(
    async (ticker: string): Promise<Asset | null> => {
        if (!ticker) return null;
        console.log(`[stocks.ts] Fetching stock by ticker from Firestore: ${ticker}`);
        try {
            // Try fetching from Saudi stocks first
            const saudiStockRef = doc(db, 'saudi_stocks', ticker.toUpperCase());
            const saudiDocSnap = await getDoc(saudiStockRef);

            if (saudiDocSnap.exists()) {
                const data = saudiDocSnap.data();
                return {
                    ticker: saudiDocSnap.id,
                    name: data.companyLongNameEn || data.name || 'Unknown Name',
                    name_ar: data.companyLongNameAr || 'اسم غير معروف',
                    price: data.price || 0,
                    change: data.change || '0.00',
                    changePercent: data.changePercent || '0.00%',
                    trend: data.trend || 'stable',
                    currency: data.currency || 'SAR',
                    category: 'Stocks',
                    country: 'SA',
                } as Asset;
            }

            // If not found in Saudi, try UAE stocks
            const uaeStockRef = doc(db, 'uae_stocks', ticker.toUpperCase());
            const uaeDocSnap = await getDoc(uaeStockRef);

            if (uaeDocSnap.exists()) {
                 const data = uaeDocSnap.data();
                return {
                    ticker: uaeDocSnap.id,
                    name: data.nameEn || 'Unknown Name',
                    name_ar: data.nameAr || 'اسم غير معروف',
                    price: data.price || 0,
                    change: data.change || '0.00',
                    changePercent: data.changePercent || '0.00%',
                    trend: data.trend || 'stable',
                    currency: data.currency || 'AED',
                    category: 'Stocks',
                    country: 'AE',
                } as Asset;
            }

            console.warn(`[stocks.ts] No stock found for ticker in any collection: ${ticker}`);
            return null;

        } catch (error) {
            console.error(`[stocks.ts] Error fetching stock by ticker ${ticker}:`, error);
            return null; // Return null on error
        }
    },
    ['single-stock'], // Cache key parts
    { tags: ['stocks'], revalidate: 3600 } // Revalidate every hour
);