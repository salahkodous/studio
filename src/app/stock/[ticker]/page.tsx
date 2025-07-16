
import { notFound } from 'next/navigation'
import { getStockPriceHistory, staticAssets } from '@/lib/data'
import { StockChart } from '@/components/stock-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'
import { NewsSummary } from '@/components/news-summary'
import { Badge } from '@/components/ui/badge'
import { getStockByTicker } from '@/lib/stocks'
import type { Asset } from '@/lib/stocks'

export default async function StockDetailPage({ params }: { params: { ticker: string } }) {
  let asset: Asset | null = await getStockByTicker(params.ticker);
  
  if (!asset) {
    // If not found in Firestore, check the static (non-stock) assets
    asset = staticAssets.find((s) => s.ticker.toLowerCase() === params.ticker.toLowerCase()) || null;
  }

  if (!asset) {
    notFound()
  }

  const priceHistory = getStockPriceHistory(asset.ticker, asset.price)

  const TrendIcon =
    asset.trend === 'up'
      ? ArrowUpRight
      : asset.trend === 'down'
      ? ArrowDownRight
      : Minus
  const trendColor =
    asset.trend === 'up'
      ? 'text-success'
      : asset.trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground'
  const currencySymbol = getCurrencySymbol(asset.currency);

  const countryMap = {
      SA: 'السعودية',
      EG: 'مصر',
      AE: 'الإمارات',
      Global: 'عالمي'
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold font-headline">{asset.name_ar}</h1>
            <Badge variant="outline">{asset.ticker}</Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
             <Badge variant="secondary">{asset.category}</Badge>
             <Badge variant="secondary">{countryMap[asset.country]}</Badge>
          </div>
        </div>
        <div className="text-left md:text-right shrink-0">
          <p className="text-3xl font-bold">{asset.price.toFixed(2)} {currencySymbol}</p>
          <div className={`flex items-center justify-start md:justify-end text-md ${trendColor}`}>
            <TrendIcon className="h-5 w-5 mr-1" />
            <span>
              {asset.change} ({asset.changePercent})
            </span>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>أداء الأصل (آخر 90 يومًا)</CardTitle>
          <CardDescription>
            عرض تاريخي لسعر إغلاق الأصل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockChart data={priceHistory} />
        </CardContent>
      </Card>

      {asset.category === 'Stocks' && <NewsSummary asset={asset} />}

    </div>
  )
}
