import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus, X } from 'lucide-react'
import type { Stock } from '@/lib/data'
import { Button } from './ui/button'
import { getCurrencySymbol } from '@/lib/utils'

interface StockCardProps {
  stock: Stock
  onRemove?: (ticker: string) => void
}

export function StockCard({ stock, onRemove }: StockCardProps) {
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

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemove) {
      onRemove(stock.ticker)
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
          aria-label={`إزالة ${stock.name} من قائمة المتابعة`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Link
        href={`/stock/${stock.ticker}`}
        className="block h-full cursor-pointer"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{stock.name}</CardTitle>
          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            {stock.ticker}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stock.price.toFixed(2)} {currencySymbol}</div>
          <div className={`flex items-center text-xs ${trendColor}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>
              {stock.change} ({stock.changePercent})
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
