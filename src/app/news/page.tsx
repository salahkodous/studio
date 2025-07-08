import { NewsSummary } from '@/components/news-summary'
import { newsArticles, assets } from '@/lib/data'

export default function NewsPage() {
  const assetsWithNews = assets.filter(
    (asset) => asset.category === 'Stocks' && asset.ticker in newsArticles && newsArticles[asset.ticker].length > 0
  )

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">أخبار السوق</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assetsWithNews.map((asset) => (
          <NewsSummary key={asset.ticker} ticker={asset.ticker} />
        ))}
      </div>
    </div>
  )
}
