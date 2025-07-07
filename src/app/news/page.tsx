import { NewsSummary } from '@/components/news-summary'
import { newsArticles, stocks } from '@/lib/data'

export default function NewsPage() {
  const stocksWithNews = stocks.filter(
    (s) => s.ticker in newsArticles && newsArticles[s.ticker].length > 0
  )

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Market News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stocksWithNews.map((stock) => (
          <NewsSummary key={stock.ticker} ticker={stock.ticker} />
        ))}
         {stocksWithNews.map((stock) => (
          <NewsSummary key={`${stock.ticker}-2`} ticker={stock.ticker} />
        ))}
      </div>
    </div>
  )
}
