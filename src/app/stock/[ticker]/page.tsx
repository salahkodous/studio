import { stocks, getStockPriceHistory } from '@/lib/data'
import { notFound } from 'next/navigation'
import { StockChart } from '@/components/stock-chart'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { NewsSummary } from '@/components/news-summary'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'

export default function StockDetailPage({
  params,
}: {
  params: { ticker: string }
}) {
  const stock = stocks.find(
    (s) => s.ticker.toLowerCase() === params.ticker.toLowerCase()
  )

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
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline">
            {stock.name} ({stock.ticker})
          </h1>
          <div className="flex items-baseline gap-4 mt-2">
            <p className="text-3xl font-bold">{stock.price.toFixed(2)} {currencySymbol}</p>
            <div className={`flex items-center text-lg ${trendColor}`}>
              <TrendIcon className="h-5 w-5 mr-1" />
              <span>
                {stock.change} ({stock.changePercent})
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة إلى قائمة المتابعة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">الرسم البياني للسعر (90 يومًا)</CardTitle>
          <CardDescription>
            رسم بياني تفاعلي يوضح أداء السهم.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 md:p-4">
          <StockChart data={priceHistory} currency={stock.currency} />
        </CardContent>
      </Card>

      <div className="mt-12">
        <NewsSummary ticker={stock.ticker} />
      </div>
    </div>
  )
}
