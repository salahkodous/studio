
export interface Asset {
  ticker: string
  name: string
  name_ar: string
  price: number
  change: string
  changePercent: string
  trend: 'up' | 'down' | 'stable'
  currency: 'SAR' | 'AED' | 'EGP' | 'USD'
  category: 'Stocks' | 'Gold' | 'Oil' | 'Bonds' | 'Savings Certificates' | 'Other' | 'Real Estate'
  country: 'SA' | 'AE' | 'EG' | 'Global'
  annualYield?: number
}

export interface RealEstateCity {
    cityKey: string;
    name: string;
    name_ar: string;
    country: 'SA' | 'AE' | 'EG';
    pricePerSqM: number;
    currency: 'SAR' | 'AED' | 'EGP';
    category: 'Real Estate'
}

export const realEstateData: RealEstateCity[] = [
    { cityKey: 'RIYADH', name: 'Riyadh', name_ar: 'الرياض', country: 'SA', pricePerSqM: 4500, currency: 'SAR', category: 'Real Estate'},
    { cityKey: 'JEDDAH', name: 'Jeddah', name_ar: 'جدة', country: 'SA', pricePerSqM: 3800, currency: 'SAR', category: 'Real Estate'},
    { cityKey: 'DUBAI', name: 'Dubai', name_ar: 'دبي', country: 'AE', pricePerSqM: 12000, currency: 'AED', category: 'Real Estate'},
    { cityKey: 'ABUDHABI', name: 'Abu Dhabi', name_ar: 'أبو ظبي', country: 'AE', pricePerSqM: 10500, currency: 'AED', category: 'Real Estate'},
    { cityKey: 'CAIRO', name: 'Cairo', name_ar: 'القاهرة', country: 'EG', pricePerSqM: 25000, currency: 'EGP', category: 'Real Estate'},
];

// This is the master list of NON-STOCK assets.
// Stock data is now fetched dynamically from Firestore.
export const staticAssets: Asset[] = [
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
  'EMAAR': [
      'https://www.arabianbusiness.com/industries/real-estate/emaar-properties-sees-q1-2024-profit-jump-to-1-1bn',
      'https://www.reuters.com/world/middle-east/dubais-emaar-properties-board-proposes-50-cash-dividend-2023-2024-03-21/'
  ],
  'IHC': [
    'https://www.thenationalnews.com/business/markets/2023/10/26/ihc-reports-18-rise-in-q3-net-profit-on-higher-revenue/',
    'https://www.khaleejtimes.com/business/ihc-to-list-subsidiary-on-adx-second-market'
  ],
   'COMI': [ // CIB Egypt
    'https://www.reuters.com/business/finance/egypts-cib-posts-strong-q1-profit-jump-forex-gains-2024-05-09/',
    'https://www.zawya.com/en/markets/equities/egypts-cib-awarded-best-bank-in-sustainable-finance-in-emerging-markets-2023-by-global-finance-p8h98vpl'
  ]
}

export const getStockPriceHistory = (
  ticker: string,
  basePrice: number = 100
): { date: string; price: number }[] => {
  const data = []
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

    