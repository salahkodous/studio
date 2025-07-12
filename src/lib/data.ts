
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

const getCountryCode = (market: string): 'SA' | 'AE' | 'QA' => {
  switch (market) {
    case 'Saudi Arabia':
      return 'SA';
    case 'UAE':
      return 'AE';
    case 'Qatar':
      return 'QA';
    default:
      return 'SA';
  }
}

const getCurrency = (country: 'SA' | 'AE' | 'QA'): 'SAR' | 'AED' | 'QAR' => {
    switch (country) {
        case 'SA': return 'SAR';
        case 'AE': return 'AED';
        case 'QA': return 'QAR';
        default: return 'SAR';
    }
}

const rawAssetsData = [
  { Symbol: '2222', "English Name": 'Saudi Arabian Oil Company', "Arabic Name": 'أرامكو السعودية', Market: 'Saudi Arabia', Price: 28.50 },
  { Symbol: '1120', "English Name": 'Al Rajhi Banking and Investment Corporation', "Arabic Name": 'مصرف الراجحي', Market: 'Saudi Arabia', Price: 80.00 },
  { Symbol: '1180', "English Name": 'The Saudi National Bank', "Arabic Name": 'البنك الأهلي السعودي', Market: 'Saudi Arabia', Price: 45.20 },
  { Symbol: '1211', "English Name": 'Saudi Arabian Mining Company (Ma\'aden)', "Arabic Name": 'معادن', Market: 'Saudi Arabia', Price: 43.00 },
  { Symbol: '7010', "English Name": 'Saudi Telecom Company', "Arabic Name": 'إس تي سي', Market: 'Saudi Arabia', Price: 38.10 },
  { Symbol: '2082', "English Name": 'ACWA Power Company', "Arabic Name": 'أكوا باور', Market: 'Saudi Arabia', Price: 375.00 },
  { Symbol: '2010', "English Name": 'Saudi Basic Industries Corporation', "Arabic Name": 'سابك', Market: 'Saudi Arabia', Price: 75.50 },
  { Symbol: '4013', "English Name": 'Dr. Sulaiman Al Habib Medical Services Group Company', "Arabic Name": 'مجموعة الدكتور سليمان الحبيب', Market: 'Saudi Arabia', Price: 298.00 },
  { Symbol: '1010', "English Name": 'Riyad Bank', "Arabic Name": 'بنك الرياض', Market: 'Saudi Arabia', Price: 27.00 },
  { Symbol: '7203', "English Name": 'Elm Company', "Arabic Name": 'علم', Market: 'Saudi Arabia', Price: 850.00 },
  { Symbol: 'ADNOCDRILL', "English Name": 'ADNOC Drilling Company P.J.S.C.', "Arabic Name": 'أدنوك للحفر', Market: 'UAE', Price: 5.80 },
  { Symbol: 'FAB', "English Name": 'First Abu Dhabi Bank P.J.S.C.', "Arabic Name": 'بنك أبوظبي الأول', Market: 'UAE', Price: 13.50 },
  { Symbol: 'EMAAR', "English Name": 'Emaar Properties PJSC', "Arabic Name": 'إعمار العقارية', Market: 'UAE', Price: 7.80 },
  { Symbol: 'TAQA', "English Name": 'Abu Dhabi National Energy Company PJSC', "Arabic Name": 'طاقة', Market: 'UAE', Price: 3.50 },
  { Symbol: 'ADCB', "English Name": 'Abu Dhabi Commercial Bank PJSC', "Arabic Name": 'بنك أبوظبي التجاري', Market: 'UAE', Price: 8.90 },
  { Symbol: 'QNBK', "English Name": 'Qatar National Bank (Q.P.S.C.)', "Arabic Name": 'بنك قطر الوطني', Market: 'Qatar', Price: 14.00 },
  { Symbol: 'IQCD', "English Name": 'Industries Qatar Q.P.S.C.', "Arabic Name": 'صناعات قطر', Market: 'Qatar', Price: 12.50 },
  { Symbol: 'QIBK', "English Name": 'Qatar Islamic Bank (Q.P.S.C.)', "Arabic Name": 'مصرف قطر الإسلامي', Market: 'Qatar', Price: 17.20 },
  { Symbol: 'ORDS', "English Name": 'Ooredoo Q.P.S.C.', "Arabic Name": 'أوريدو', Market: 'Qatar', Price: 9.80 },
  { Symbol: 'QGTS', "English Name": 'Qatar Gas Transport Company Limited (Nakilat) (QPSC)', "Arabic Name": 'ناقلات', Market: 'Qatar', Price: 4.10 }
];

const uniqueAssets = new Map<string, typeof rawAssetsData[0]>();
rawAssetsData.forEach(asset => {
    if (!uniqueAssets.has(asset.Symbol)) {
        uniqueAssets.set(asset.Symbol, asset);
    }
});


export const assets: Asset[] = Array.from(uniqueAssets.values()).map(asset => {
    const country = getCountryCode(asset.Market);
    const currency = getCurrency(country);
    return {
        ticker: asset.Symbol,
        name: asset['English Name'],
        name_ar: asset['Arabic Name'] || asset['English Name'],
        country: country,
        currency: currency,
        price: asset.Price,
        change: "+0.15", // Static placeholder
        changePercent: "+0.50%", // Static placeholder
        trend: 'up', // Static placeholder
        category: 'Stocks',
    }
}).concat([
  // Gold Assets
  {
    ticker: 'GOLD', name: 'Gold', name_ar: 'الذهب', price: 2330, change: '+1.25', changePercent: '+0.70%', trend: 'up', currency: 'USD', category: 'Gold', country: 'Global',
  },
  // Oil Assets
  {
    ticker: 'BRENT', name: 'Brent Crude Oil', name_ar: 'نفط برنت الخام', price: 85.3, change: '-0.50', changePercent: '-0.58%', trend: 'down', currency: 'USD', category: 'Oil', country: 'Global',
  },
  // Bonds & Savings
  {
    ticker: 'SA-BOND-2030', name: 'Saudi Arabia Govt. Bond 2030', name_ar: 'سندات حكومة السعودية 2030', price: 102.5, change: '+0.05', changePercent: '+0.05%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SUKUK-ISDB', name: 'Islamic Development Bank Sukuk', name_ar: 'صكوك بنك التنمية الإسلامي', price: 100.2, change: '+0.02', changePercent: '+0.02%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SAVINGS-CERT-SAR', name: 'SAR Savings Certificate', name_ar: 'شهادة ادخار بالريال السعودي', price: 1, change: '+0.00', changePercent: '5.00%', trend: 'stable', currency: 'SAR', category: 'Savings Certificates', country: 'Global', annualYield: 0.05,
  },
]);

export const newsArticles: Record<string, string[]> = {
  '2222': [ // ARAMCO
    'https://www.reuters.com/business/energy/saudi-aramco-hikes-july-crude-prices-asia-2023-06-05/',
    'https://www.bloomberg.com/news/articles/2023-06-05/oil-extends-gains-after-saudi-arabia-pledges-deeper-output-cuts',
  ],
  '2010': [ // SABIC (Using the English Name for mapping)
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
