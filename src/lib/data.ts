
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

export interface RealEstateCity {
    cityKey: string;
    name: string;
    name_ar: string;
    country: 'SA' | 'AE' | 'QA';
    pricePerSqM: number;
    currency: 'SAR' | 'AED' | 'QAR';
}

export const realEstateData: RealEstateCity[] = [
    { cityKey: 'RIYADH', name: 'Riyadh', name_ar: 'الرياض', country: 'SA', pricePerSqM: 4500, currency: 'SAR'},
    { cityKey: 'JEDDAH', name: 'Jeddah', name_ar: 'جدة', country: 'SA', pricePerSqM: 3800, currency: 'SAR'},
    { cityKey: 'DUBAI', name: 'Dubai', name_ar: 'دبي', country: 'AE', pricePerSqM: 12000, currency: 'AED'},
    { cityKey: 'ABUDHABI', name: 'Abu Dhabi', name_ar: 'أبو ظبي', country: 'AE', pricePerSqM: 10500, currency: 'AED'},
    { cityKey: 'DOHA', name: 'Doha', name_ar: 'الدوحة', country: 'QA', pricePerSqM: 15000, currency: 'QAR'},
];

// This is the master list of assets. It contains the correct tickers and names.
// Prices here are FALLBACKS ONLY and should be stable.
export const assets: Asset[] = [
    // Saudi Arabia (SA)
    { ticker: '2222', name: 'Saudi Arabian Oil Company', name_ar: 'أرامكو السعودية', country: 'SA', currency: 'SAR', price: 28.50, change: "+0.15", changePercent: "+0.53%", trend: 'up', category: 'Stocks' },
    { ticker: '1120', name: 'Al Rajhi Banking and Investment Corporation', name_ar: 'مصرف الراجحي', country: 'SA', currency: 'SAR', price: 80.00, change: "-0.50", changePercent: "-0.62%", trend: 'down', category: 'Stocks' },
    { ticker: '1180', name: 'The Saudi National Bank', name_ar: 'البنك الأهلي السعودي', country: 'SA', currency: 'SAR', price: 45.20, change: "+0.20", changePercent: "+0.44%", trend: 'up', category: 'Stocks' },
    { ticker: '1211', name: 'Saudi Arabian Mining Company (Ma\'aden)', name_ar: 'معادن', country: 'SA', currency: 'SAR', price: 43.00, change: "0.00", changePercent: "0.00%", trend: 'stable', category: 'Stocks' },
    { ticker: '7010', name: 'Saudi Telecom Company', name_ar: 'إس تي سي', country: 'SA', currency: 'SAR', price: 38.10, change: "-0.10", changePercent: "-0.26%", trend: 'down', category: 'Stocks' },
    { ticker: '2082', name: 'ACWA Power Company', name_ar: 'أكوا باور', country: 'SA', currency: 'SAR', price: 375.00, change: "+5.00", changePercent: "+1.35%", trend: 'up', category: 'Stocks' },
    { ticker: '2010', name: 'Saudi Basic Industries Corporation', name_ar: 'سابك', country: 'SA', currency: 'SAR', price: 75.50, change: "+0.25", changePercent: "+0.33%", trend: 'up', category: 'Stocks' },
    { ticker: '4013', name: 'Dr. Sulaiman Al Habib Medical Services Group Company', name_ar: 'مجموعة الدكتور سليمان الحبيب', country: 'SA', currency: 'SAR', price: 298.00, change: "-2.00", changePercent: "-0.67%", trend: 'down', category: 'Stocks' },
    { ticker: '1010', name: 'Riyad Bank', name_ar: 'بنك الرياض', country: 'SA', currency: 'SAR', price: 27.00, change: "+0.05", changePercent: "+0.19%", trend: 'up', category: 'Stocks' },
    { ticker: '7203', name: 'Elm Company', name_ar: 'علم', country: 'SA', currency: 'SAR', price: 850.00, change: "+10.00", changePercent: "+1.19%", trend: 'up', category: 'Stocks' },

    // UAE (AE)
    { ticker: 'ADNOCDRILL', name: 'ADNOC Drilling Company P.J.S.C.', name_ar: 'أدنوك للحفر', country: 'AE', currency: 'AED', price: 5.80, change: "+0.02", changePercent: "+0.35%", trend: 'up', category: 'Stocks' },
    { ticker: 'FAB', name: 'First Abu Dhabi Bank P.J.S.C.', name_ar: 'بنك أبوظبي الأول', country: 'AE', currency: 'AED', price: 13.50, change: "0.00", changePercent: "0.00%", trend: 'stable', category: 'Stocks' },
    { ticker: 'EMAAR', name: 'Emaar Properties PJSC', name_ar: 'إعمار العقارية', country: 'AE', currency: 'AED', price: 7.80, change: "-0.05", changePercent: "-0.64%", trend: 'down', category: 'Stocks' },
    { ticker: 'TAQA', name: 'Abu Dhabi National Energy Company PJSC', name_ar: 'طاقة', country: 'AE', currency: 'AED', price: 3.50, change: "+0.01", changePercent: "+0.29%", trend: 'up', category: 'Stocks' },
    { ticker: 'ADCB', name: 'Abu Dhabi Commercial Bank PJSC', name_ar: 'بنك أبوظبي التجاري', country: 'AE', currency: 'AED', price: 8.90, change: "+0.10", changePercent: "+1.14%", trend: 'up', category: 'Stocks' },

    // Qatar (QA)
    { ticker: 'QNBK', name: 'Qatar National Bank (Q.P.S.C.)', name_ar: 'بنك قطر الوطني', country: 'QA', currency: 'QAR', price: 14.00, change: "-0.10", changePercent: "-0.71%", trend: 'down', category: 'Stocks' },
    { ticker: 'IQCD', name: 'Industries Qatar Q.P.S.C.', name_ar: 'صناعات قطر', country: 'QA', currency: 'QAR', price: 12.50, change: "+0.05", changePercent: "+0.40%", trend: 'up', category: 'Stocks' },
    { ticker: 'QIBK', name: 'Qatar Islamic Bank (Q.P.S.C.)', name_ar: 'مصرف قطر الإسلامي', country: 'QA', currency: 'QAR', price: 17.20, change: "0.00", changePercent: "0.00%", trend: 'stable', category: 'Stocks' },
    { ticker: 'ORDS', name: 'Ooredoo Q.P.S.C.', name_ar: 'أوريدو', country: 'QA', currency: 'QAR', price: 9.80, change: "+0.15", changePercent: "+1.55%", trend: 'up', category: 'Stocks' },
    { ticker: 'QGTS', name: 'Qatar Gas Transport Company Limited (Nakilat) (QPSC)', name_ar: 'ناقلات', country: 'QA', currency: 'QAR', price: 4.10, change: "-0.02", changePercent: "-0.49%", trend: 'down', category: 'Stocks' },

    // Global Commodities & Bonds
    { ticker: 'GOLD', name: 'Gold', name_ar: 'الذهب', price: 2330, change: '+1.25', changePercent: '+0.70%', trend: 'up', currency: 'USD', category: 'Gold', country: 'Global' },
    { ticker: 'BRENT', name: 'Brent Crude Oil', name_ar: 'نفط برنت الخام', price: 85.3, change: '-0.50', changePercent: '-0.58%', trend: 'down', currency: 'USD', category: 'Oil', country: 'Global' },
    { ticker: 'SA-BOND-2030', name: 'Saudi Arabia Govt. Bond 2030', name_ar: 'سندات حكومة السعودية 2030', price: 102.5, change: '+0.05', changePercent: '+0.05%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global' },
    { ticker: 'SUKUK-ISDB', name: 'Islamic Development Bank Sukuk', name_ar: 'صكوك بنك التنمية الإسلامي', price: 100.2, change: '+0.02', changePercent: '+0.02%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global' },
    { ticker: 'SAVINGS-CERT-SAR', name: 'SAR Savings Certificate', name_ar: 'شهادة ادخار بالريال السعودي', price: 1, change: '+0.00', changePercent: '5.00%', trend: 'stable', currency: 'SAR', category: 'Savings Certificates', country: 'SA', annualYield: 0.05 },
];


export const newsArticles: Record<string, string[]> = {
  '2222': [ // ARAMCO
    'https://www.reuters.com/business/energy/saudi-aramco-hikes-july-crude-prices-asia-2023-06-05/',
    'https://www.bloomberg.com/news/articles/2023-06-05/oil-extends-gains-after-saudi-arabia-pledges-deeper-output-cuts',
  ],
  '2010': [ // SABIC
    'https://www.arabianbusiness.com/industries/energy/sabic-launches-new-sustainable-polymers-at-leading-plastics-conference',
    'https://www.argaam.com/en/article/articledetail/id/1654321',
  ],
  'IHC': [
    'https://www.thenationalnews.com/business/markets/2023/10/26/ihc-reports-18-rise-in-q3-net-profit-on-higher-revenue/',
    'https://www.khaleejtimes.com/business/ihc-to-list-subsidiary-on-adx-second-market'
  ],
  'QNBK': [ // QNB
    'https://www.gulf-times.com/article/669821/business/qnb-groups-net-profit-up-8-to-qr11-9bn-in-9m-2023',
    'https://www.zawya.com/en/islamic-economy/islamic-finance/qatar-national-bank-qnb-unit-qnb-finansbank-mandates-banks-for-green-bonds-issuance-x2wv61a9'
  ]
}

export const getStockPriceHistory = (
  ticker: string
): { date: string; price: number }[] => {
  const data = []
  const asset = assets.find((s) => s.ticker === ticker);
  const basePrice = asset?.price || 100;
  const days = 90
  let price = basePrice > 0 ? basePrice : 100; // Use a default if base price is 0
  for (let i = days; i > 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Fluctuation relative to base price to keep it somewhat realistic
    price = price + (Math.random() - 0.49) * (price / 50)
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    })
  }
  return data
}
