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
}

export interface RealEstateCity {
    cityKey: string;
    name: string;
    country: 'SA' | 'AE' | 'QA';
    pricePerSqM: number;
    currency: 'SAR' | 'AED' | 'QAR';
}

export const realEstateData: RealEstateCity[] = [
    { cityKey: 'RIYADH', name: 'الرياض', country: 'SA', pricePerSqM: 4500, currency: 'SAR'},
    { cityKey: 'JEDDAH', name: 'جدة', country: 'SA', pricePerSqM: 3800, currency: 'SAR'},
    { cityKey: 'DUBAI', name: 'دبي', country: 'AE', pricePerSqM: 12000, currency: 'AED'},
    { cityKey: 'ABUDHABI', name: 'أبوظبي', country: 'AE', pricePerSqM: 10500, currency: 'AED'},
    { cityKey: 'DOHA', name: 'الدوحة', country: 'QA', pricePerSqM: 15000, currency: 'QAR'},
];

export const assets: Asset[] = [
  // Saudi Stocks (SA)
  {
    ticker: 'ARAMCO',
    name: 'أرامكو السعودية',
    price: 34.8,
    change: '+0.45',
    changePercent: '+1.31%',
    trend: 'up',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'ALRAJHI',
    name: 'مصرف الراجحي',
    price: 80.2,
    change: '-0.10',
    changePercent: '-0.12%',
    trend: 'down',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'SABIC',
    name: 'سابك',
    price: 92.5,
    change: '+1.20',
    changePercent: '+1.31%',
    trend: 'up',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'SNB',
    name: 'البنك الأهلي السعودي',
    price: 45.1,
    change: '+0.20',
    changePercent: '+0.45%',
    trend: 'up',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'STC',
    name: 'إس تي سي',
    price: 38.7,
    change: '-0.15',
    changePercent: '-0.39%',
    trend: 'down',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'ACWA',
    name: 'أكوا باور',
    price: 130.0,
    change: '+2.50',
    changePercent: '+1.96%',
    trend: 'up',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },
  {
    ticker: 'MAADEN',
    name: 'معادن',
    price: 65.4,
    change: '-0.20',
    changePercent: '-0.31%',
    trend: 'down',
    currency: 'SAR',
    category: 'Stocks',
    country: 'SA',
  },

  // Qatar Stocks (QA)
  {
    ticker: 'QNB',
    name: 'بنك قطر الوطني',
    price: 17.5,
    change: '+0.05',
    changePercent: '+0.29%',
    trend: 'up',
    currency: 'QAR',
    category: 'Stocks',
    country: 'QA',
  },
  {
    ticker: 'INDUSTRIES',
    name: 'صناعات قطر',
    price: 13.2,
    change: '0.00',
    changePercent: '0.00%',
    trend: 'stable',
    currency: 'QAR',
    category: 'Stocks',
    country: 'QA',
  },
  {
    ticker: 'QIB',
    name: 'مصرف قطر الإسلامي',
    price: 22.1,
    change: '+0.10',
    changePercent: '+0.45%',
    trend: 'up',
    currency: 'QAR',
    category: 'Stocks',
    country: 'QA',
  },

  // UAE Stocks (AE)
  {
    ticker: 'EMAAR',
    name: 'إعمار العقارية',
    price: 5.8,
    change: '0.00',
    changePercent: '0.00%',
    trend: 'stable',
    currency: 'AED',
    category: 'Stocks',
    country: 'AE',
  },
  {
    ticker: 'FAB',
    name: 'بنك أبوظبي الأول',
    price: 13.9,
    change: '-0.02',
    changePercent: '-0.14%',
    trend: 'down',
    currency: 'AED',
    category: 'Stocks',
    country: 'AE',
  },
  {
    ticker: 'ADCB',
    name: 'بنك أبوظبي التجاري',
    price: 8.9,
    change: '+0.01',
    changePercent: '+0.11%',
    trend: 'up',
    currency: 'AED',
    category: 'Stocks',
    country: 'AE',
  },
  {
    ticker: 'IHC',
    name: 'الشركة العالمية القابضة',
    price: 400.0,
    change: '+1.50',
    changePercent: '+0.38%',
    trend: 'up',
    currency: 'AED',
    category: 'Stocks',
    country: 'AE',
  },

  // Gold Assets
  {
    ticker: 'GOLD',
    name: 'ذهب',
    price: 2330, // Price per ounce
    change: '+1.25',
    changePercent: '+0.70%',
    trend: 'up',
    currency: 'USD',
    category: 'Gold',
    country: 'Global',
  },

  // Oil Assets
  {
    ticker: 'BRENT',
    name: 'نفط برنت',
    price: 85.3,
    change: '-0.50',
    changePercent: '-0.58%',
    trend: 'down',
    currency: 'USD',
    category: 'Oil',
    country: 'Global',
  },

  // Bonds & Savings
  {
    ticker: 'SA-BOND-2030',
    name: 'سندات حكومة السعودية 2030',
    price: 102.5,
    change: '+0.05',
    changePercent: '+0.05%',
    trend: 'up',
    currency: 'USD',
    category: 'Bonds',
    country: 'SA',
  },
  {
    ticker: 'SAVINGS-CERT-SAR',
    name: 'شهادات ادخار (ريال سعودي)',
    price: 1, // Represents a base value
    change: '+0.00',
    changePercent: '5.00%', // Represents annual yield
    trend: 'stable',
    currency: 'SAR',
    category: 'Savings Certificates',
    country: 'Global',
  },
]

export const newsArticles: Record<string, string[]> = {
  ARAMCO: [
    'https://www.reuters.com/business/energy/saudi-aramco-hikes-july-crude-prices-asia-2023-06-05/',
    'https://www.bloomberg.com/news/articles/2023-06-05/oil-extends-gains-after-saudi-arabia-pledges-deeper-output-cuts',
  ],
  SABIC: [
    'https://www.arabianbusiness.com/industries/energy/sabic-launches-new-sustainable-polymers-at-leading-plastics-conference',
    'https://www.argaam.com/en/article/articledetail/id/1654321',
  ],
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

    