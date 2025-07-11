export interface Asset {
  ticker: string
  name: string
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
    country: 'SA' | 'AE' | 'QA';
    pricePerSqM: number;
    currency: 'SAR' | 'AED' | 'QAR';
}

export const realEstateData: RealEstateCity[] = [
    { cityKey: 'RIYADH', name: 'Riyadh', country: 'SA', pricePerSqM: 4500, currency: 'SAR'},
    { cityKey: 'JEDDAH', name: 'Jeddah', country: 'SA', pricePerSqM: 3800, currency: 'SAR'},
    { cityKey: 'DUBAI', name: 'Dubai', country: 'AE', pricePerSqM: 12000, currency: 'AED'},
    { cityKey: 'ABUDHABI', name: 'Abu Dhabi', country: 'AE', pricePerSqM: 10500, currency: 'AED'},
    { cityKey: 'DOHA', name: 'Doha', country: 'QA', pricePerSqM: 15000, currency: 'QAR'},
];

export const assets: Asset[] = [
  // Saudi Stocks (SA) - Tickers are official
  {
    ticker: '2222', name: 'Saudi Aramco', price: 28.55, change: '-0.15', changePercent: '-0.52%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '1120', name: 'Al Rajhi Bank', price: 78.70, change: '+0.20', changePercent: '+0.25%', trend: 'up', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '1180', name: 'Saudi National Bank', price: 37.05, change: '-0.20', changePercent: '-0.54%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '7010', name: 'Saudi Telecom Company', price: 37.95, change: '+0.15', changePercent: '+0.40%', trend: 'up', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '2010', name: 'SABIC', price: 73.80, change: '-0.10', changePercent: '-0.14%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '1211', name: 'Maaden', price: 44.20, change: '-0.45', changePercent: '-1.01%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '1010', name: 'Riyad Bank', price: 26.50, change: '0.00', changePercent: '0.00%', trend: 'stable', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '2082', name: 'ACWA Power', price: 380.00, change: '-5.00', changePercent: '-1.30%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '1150', name: 'Banque Saudi Fransi', price: 39.00, change: '+0.50', changePercent: '+1.30%', trend: 'up', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '4001', name: 'Saudi Cement', price: 45.00, change: '0.00', changePercent: '0.00%', trend: 'stable', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '4002', name: 'Yamama Cement', price: 30.00, change: '-0.20', changePercent: '-0.66%', trend: 'down', currency: 'SAR', category: 'Stocks', country: 'SA',
  },
  {
    ticker: '6010', name: 'Jarir Marketing', price: 150.00, change: '+1.00', changePercent: '+0.67%', trend: 'up', currency: 'SAR', category: 'Stocks', country: 'SA',
  },

  // Qatar Stocks (QA) - Tickers are official
  {
    ticker: 'QNBK', name: 'Qatar National Bank', price: 13.78, change: '+0.03', changePercent: '+0.22%', trend: 'up', currency: 'QAR', category: 'Stocks', country: 'QA',
  },
  {
    ticker: 'IQCD', name: 'Industries Qatar', price: 13.00, change: '-0.05', changePercent: '-0.38%', trend: 'down', currency: 'QAR', category: 'Stocks', country: 'QA',
  },
  {
    ticker: 'QIBK', name: 'Qatar Islamic Bank', price: 22.1, change: '+0.10', changePercent: '+0.45%', trend: 'up', currency: 'QAR', category: 'Stocks', country: 'QA',
  },
  {
    ticker: 'ORDS', name: 'Ooredoo', price: 10.1, change: '-0.05', changePercent: '-0.49%', trend: 'down', currency: 'QAR', category: 'Stocks', country: 'QA',
  },
  
  // UAE Stocks (AE) - Tickers are official
  {
    ticker: 'EMAAR', name: 'Emaar Properties', price: 7.75, change: '-0.03', changePercent: '-0.39%', trend: 'down', currency: 'AED', category: 'Stocks', country: 'AE',
  },
  {
    ticker: 'FAB', name: 'First Abu Dhabi Bank', price: 13.50, change: '+0.02', changePercent: '+0.15%', trend: 'up', currency: 'AED', category: 'Stocks', country: 'AE',
  },
  {
    ticker: 'ADCB', name: 'Abu Dhabi Commercial Bank', price: 8.9, change: '+0.01', changePercent: '+0.11%', trend: 'up', currency: 'AED', category: 'Stocks', country: 'AE',
  },
  {
    ticker: 'IHC', name: 'International Holding Company', price: 400.0, change: '+1.50', changePercent: '+0.38%', trend: 'up', currency: 'AED', category: 'Stocks', country: 'AE',
  },
  {
    ticker: 'EAND', name: 'e& (Etisalat Group)', price: 18.00, change: '-0.10', changePercent: '-0.55%', trend: 'down', currency: 'AED', category: 'Stocks', country: 'AE',
  },

  // Gold Assets
  {
    ticker: 'GOLD', name: 'Gold', price: 2330, change: '+1.25', changePercent: '+0.70%', trend: 'up', currency: 'USD', category: 'Gold', country: 'Global',
  },

  // Oil Assets
  {
    ticker: 'BRENT', name: 'Brent Crude Oil', price: 85.3, change: '-0.50', changePercent: '-0.58%', trend: 'down', currency: 'USD', category: 'Oil', country: 'Global',
  },

  // Bonds & Savings
  {
    ticker: 'SA-BOND-2030', name: 'Saudi Arabia Govt. Bond 2030', price: 102.5, change: '+0.05', changePercent: '+0.05%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SUKUK-ISDB', name: 'Islamic Development Bank Sukuk', price: 100.2, change: '+0.02', changePercent: '+0.02%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SAVINGS-CERT-SAR', name: 'SAR Savings Certificate', price: 1, change: '+0.00', changePercent: '5.00%', trend: 'stable', currency: 'SAR', category: 'Savings Certificates', country: 'Global', annualYield: 0.05,
  },
]

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
  const basePrice = assets.find((s) => s.ticker === ticker)?.price || 100
  const days = 90
  let price = basePrice
  for (let i = days; i > 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    price = price + (Math.random() - 0.49) * (basePrice / 50)
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    })
  }
  return data
}
