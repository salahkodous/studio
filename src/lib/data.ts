export interface Stock {
  ticker: string
  name: string
  price: number
  change: string
  changePercent: string
  trend: 'up' | 'down' | 'stable'
  currency: 'SAR' | 'QAR' | 'AED'
}

export const stocks: Stock[] = [
  {
    ticker: 'ARAMCO',
    name: 'أرامكو السعودية',
    price: 34.8,
    change: '+0.45',
    changePercent: '+1.31%',
    trend: 'up',
    currency: 'SAR',
  },
  {
    ticker: 'ALRAJHI',
    name: 'مصرف الراجحي',
    price: 80.2,
    change: '-0.10',
    changePercent: '-0.12%',
    trend: 'down',
    currency: 'SAR',
  },
  {
    ticker: 'SABIC',
    name: 'سابك',
    price: 92.5,
    change: '+1.20',
    changePercent: '+1.31%',
    trend: 'up',
    currency: 'SAR',
  },
  {
    ticker: 'QNB',
    name: 'بنك قطر الوطني',
    price: 17.5,
    change: '+0.05',
    changePercent: '+0.29%',
    trend: 'up',
    currency: 'QAR',
  },
  {
    ticker: 'EMAAR',
    name: 'إعمار العقارية',
    price: 5.8,
    change: '0.00',
    changePercent: '0.00%',
    trend: 'stable',
    currency: 'AED',
  },
  {
    ticker: 'FAB',
    name: 'بنك أبوظبي الأول',
    price: 13.9,
    change: '-0.02',
    changePercent: '-0.14%',
    trend: 'down',
    currency: 'AED',
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
  ALRAJHI: [],
  QNB: [],
  EMAAR: [],
  FAB: [],
}

export const getStockPriceHistory = (
  ticker: string
): { date: string; price: number }[] => {
  const data = []
  const basePrice = stocks.find((s) => s.ticker === ticker)?.price || 100
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
