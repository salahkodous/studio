import { notFound } from 'next/navigation'
import { stocks, getStockPriceHistory } from '@/lib/data'
import { StockChart } from '@/components/stock-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'
import { NewsSummary } from '@/components/news-summary'

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const stock = stocks.find((s) => s.ticker.toLowerCase() === params.ticker.toLowerCase())

  if (!stock) {
    notFound()
  }

  const priceHistory = getStockPriceHistory(stock.ticker)

  const TrendIcon =
    stock.trend === 'up'
      ? ArrowUpRight
      : stock.trend === 'down'
      ? ArrowDownRight
      : Minus
  const trendColor =
    stock.trend === 'up'
      ? 'text-success'
      : stock.trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground'
  const currencySymbol = getCurrencySymbol(stock.currency);

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline">{stock.name}</h1>
          <p className="text-lg text-muted-foreground">{stock.ticker}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-3xl font-bold">{stock.price.toFixed(2)} {currencySymbol}</p>
          <div className={`flex items-center justify-start md:justify-end text-md ${trendColor}`}>
            <TrendIcon className="h-5 w-5 mr-1" />
            <span>
              {stock.change} ({stock.changePercent})
            </span>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>أداء السهم (آخر 90 يومًا)</CardTitle>
          <CardDescription>
            عرض تاريخي لسعر إغلاق السهم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockChart data={priceHistory} />
        </CardContent>
      </Card>

      <NewsSummary ticker={stock.ticker} />

    </div>
  )
}
