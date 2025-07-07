'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StockCard } from '@/components/stock-card'
import { stocks, user as initialUser } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export default function WatchlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [watchlist, setWatchlist] = useState(initialUser.watchlist)
  const [selectedStock, setSelectedStock] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const watchlistStocks = stocks.filter((stock) =>
    watchlist.includes(stock.ticker)
  )
  const availableStocks = stocks.filter(
    (stock) => !watchlist.includes(stock.ticker)
  )

  const handleAddToWatchlist = () => {
    if (selectedStock && !watchlist.includes(selectedStock)) {
      setWatchlist([...watchlist, selectedStock])
      const stock = stocks.find((s) => s.ticker === selectedStock)
      toast({
        title: 'أضيف إلى قائمة المتابعة',
        description: `${stock?.name || selectedStock} تمت إضافته.`,
      })
      setSelectedStock('')
    }
  }

  const handleRemoveFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter((t) => t !== ticker))
    const stock = stocks.find((s) => s.ticker === ticker)
    toast({
      title: 'تمت الإزالة من قائمة المتابعة',
      description: `${stock?.name || ticker} تمت إزالته.`,
      variant: 'destructive',
    })
  }

  if (loading || !user) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-60" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">قائمة المتابعة</h1>
        <div className="flex gap-2">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="أضف سهماً للمتابعة" />
            </SelectTrigger>
            <SelectContent>
              {availableStocks.map((stock) => (
                <SelectItem key={stock.ticker} value={stock.ticker}>
                  {stock.name} ({stock.ticker})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddToWatchlist} disabled={!selectedStock}>
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة
          </Button>
        </div>
      </div>

      {watchlistStocks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlistStocks.map((stock) => (
            <StockCard
              key={stock.ticker}
              stock={stock}
              onRemove={handleRemoveFromWatchlist}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-muted-foreground">
            قائمة المتابعة فارغة
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            أضف أسهماً باستخدام القائمة المنسدلة أعلاه لتتبعها هنا.
          </p>
        </div>
      )}
    </div>
  )
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-2/4" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}
