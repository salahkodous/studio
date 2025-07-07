import { StockCard } from '@/components/stock-card'
import { stocks } from '@/lib/data'
import { NewsSummary } from '@/components/news-summary'

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">لوحة تحكم الأسهم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stocks.map((stock) => (
          <StockCard key={stock.ticker} stock={stock} />
        ))}
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 font-headline">
          آخر ملخصات الأخبار
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NewsSummary ticker="ARAMCO" />
          <NewsSummary ticker="SABIC" />
        </div>
      </div>
    </div>
  )
}
