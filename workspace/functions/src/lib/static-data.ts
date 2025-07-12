
/**
 * @fileOverview Static data for assets used by the backend functions.
 * This should be kept in sync with the frontend's /src/lib/data.ts
 */

export interface Asset {
  ticker: string
  name: string
  name_ar: string
  price: number
  change: string
  changePercent: string
  trend: 'up' | 'down' | 'stable'
  currency: 'SAR' | 'QAR' | 'AED' | 'USD'
  category: 'Stocks' | 'Gold' | 'Oil' | 'Bonds' | 'Savings Certificates' | 'Other'
  country: 'SA' | 'QA' | 'AE' | 'Global'
  annualYield?: number
}

// This is the master list of assets. It contains the correct tickers and names.
export const assets: Asset[] = [
    // Saudi Arabia (SA)
    { ticker: '2222', name: 'Saudi Arabian Oil Company', name_ar: 'أرامكو السعودية', country: 'SA', currency: 'SAR', price: 28.50, change: "+0.15", changePercent: "+0.53%", trend: 'up', category: 'Stocks' },
    { ticker: '1120', name: 'Al Rajhi Banking and Investment Corporation', name_ar: 'مصرف الراجحي', country: 'SA', currency: 'SAR', price: 80.00, change: "-0.50", changePercent: "-0.62%", trend: 'down', category: 'Stocks' },
    { ticker: '1180', name: 'The Saudi National Bank', name_ar: 'البنك الأهلي السعودي', country: 'SA', currency: 'SAR', price: 45.20, change: "+0.20", changePercent: "+0.44%", trend: 'up', category: 'Stocks' },
    { ticker: '7010', name: 'Saudi Telecom Company', name_ar: 'إس تي سي', country: 'SA', currency: 'SAR', price: 38.10, change: "-0.10", changePercent: "-0.26%", trend: 'down', category: 'Stocks' },
    { ticker: '2010', name: 'Saudi Basic Industries Corporation', name_ar: 'سابك', country: 'SA', currency: 'SAR', price: 75.50, change: "+0.25", changePercent: "+0.33%", trend: 'up', category: 'Stocks' },
    { ticker: '1010', name: 'Riyad Bank', name_ar: 'بنك الرياض', country: 'SA', currency: 'SAR', price: 27.00, change: "+0.05", changePercent: "+0.19%", trend: 'up', category: 'Stocks' },

    // UAE (AE)
    { ticker: 'IHC', name: 'International Holding Company', name_ar: 'الشركة العالمية القابضة', country: 'AE', currency: 'AED', price: 400.0, change: "-1.00", changePercent: "-0.25%", trend: 'down', category: 'Stocks'},
    { ticker: 'FAB', name: 'First Abu Dhabi Bank P.J.S.C.', name_ar: 'بنك أبوظبي الأول', country: 'AE', currency: 'AED', price: 13.50, change: "0.00", changePercent: "0.00%", trend: 'stable', category: 'Stocks' },
    { ticker: 'EMAAR', name: 'Emaar Properties PJSC', name_ar: 'إعمار العقارية', country: 'AE', currency: 'AED', price: 7.80, change: "-0.05", changePercent: "-0.64%", trend: 'down', category: 'Stocks' },
    { ticker: 'TAQA', name: 'Abu Dhabi National Energy Company PJSC', name_ar: 'طاقة', country: 'AE', currency: 'AED', price: 3.50, change: "+0.01", changePercent: "+0.29%", trend: 'up', category: 'Stocks' },
    { ticker: 'ADCB', name: 'Abu Dhabi Commercial Bank PJSC', name_ar: 'بنك أبوظبي التجاري', country: 'AE', currency: 'AED', price: 8.90, change: "+0.10", changePercent: "+1.14%", trend: 'up', category: 'Stocks' },

    // Qatar (QA)
    { ticker: 'QNBK', name: 'Qatar National Bank (Q.P.S.C.)', name_ar: 'بنك قطر الوطني', country: 'QA', currency: 'QAR', price: 14.00, change: "-0.10", changePercent: "-0.71%", trend: 'down', category: 'Stocks' },
    { ticker: 'IQCD', name: 'Industries Qatar Q.P.S.C.', name_ar: 'صناعات قطر', country: 'QA', currency: 'QAR', price: 12.50, change: "+0.05", changePercent: "+0.40%", trend: 'up', category: 'Stocks' },
    { ticker: 'QIBK', name: 'Qatar Islamic Bank (Q.P.S.C.)', name_ar: 'مصرف قطر الإسلامي', country: 'QA', currency: 'QAR', price: 17.20, change: "0.00", changePercent: "0.00%", trend: 'stable', category: 'Stocks' },
    { ticker: 'CBQK', name: 'The Commercial Bank (P.S.Q.C.)', name_ar: 'البنك التجاري', country: 'QA', currency: 'QAR', price: 5.50, change: "+0.03", changePercent: "+0.55%", trend: 'up', category: 'Stocks' },
    { ticker: 'QGTS', name: 'Qatar Gas Transport Company Limited (Nakilat) (QPSC)', name_ar: 'ناقلات', country: 'QA', currency: 'QAR', price: 4.10, change: "-0.02", changePercent: "-0.49%", trend: 'down', category: 'Stocks' },

    // Global Commodities & Bonds
    { ticker: 'GOLD', name: 'Gold', name_ar: 'الذهب', price: 2330, change: '+1.25', changePercent: '+0.70%', trend: 'up', currency: 'USD', category: 'Gold', country: 'Global' },
    { ticker: 'BRENT', name: 'Brent Crude Oil', name_ar: 'نفط برنت الخام', price: 85.3, change: '-0.50', changePercent: '-0.58%', trend: 'down', currency: 'USD', category: 'Oil', country: 'Global' },
    { ticker: 'SA-BOND-2030', name: 'Saudi Arabia Govt. Bond 2030', name_ar: 'سندات حكومة السعودية 2030', price: 102.5, change: '+0.05', changePercent: '+0.05%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global' },
    { ticker: 'SUKUK-ISDB', name: 'Islamic Development Bank Sukuk', name_ar: 'صكوك بنك التنمية الإسلامي', price: 100.2, change: '+0.02', changePercent: '+0.02%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global' },
    { ticker: 'SAVINGS-CERT-SAR', name: 'SAR Savings Certificate', name_ar: 'شهادة ادخار بالريال السعودي', price: 1, change: '+0.00', changePercent: '5.00%', trend: 'stable', currency: 'SAR', category: 'Savings Certificates', country: 'SA', annualYield: 0.05 },
];
