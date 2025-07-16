import Link from 'next/link'
import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus, X } from 'lucide-react'
import { Button } from './ui/button'
import { getCurrencySymbol } from '@/lib/utils'
import type { Asset } from '@/lib/stocks'

interface AssetCardProps {
  asset: Asset
  onRemove?: (ticker: string) => void
}

export const AssetCard = memo(function AssetCard({ asset, onRemove }: AssetCardProps) {
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

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemove) {
      onRemove(asset.ticker)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative group bg-card">
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleRemove}
          aria-label={`إزالة ${asset.name_ar} من قائمة المتابعة`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Link
        href={`/stock/${asset.ticker}`}
        className="block h-full cursor-pointer"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{asset.name_ar}</CardTitle>
          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            {asset.ticker}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{asset.price.toFixed(2)} {currencySymbol}</div>
          <div className={`flex items-center text-xs ${trendColor}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>
              {asset.change} ({asset.changePercent})
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
})
