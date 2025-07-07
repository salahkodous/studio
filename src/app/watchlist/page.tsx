'use client'
import { useState } from 'react'
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

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(initialUser.watchlist)
  const [selectedStock, setSelectedStock] = useState('')
  const { toast } = useToast()

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
        title: 'Added to Watchlist',
        description: `${stock?.name || selectedStock} has been added.`,
      })
      setSelectedStock('')
    }
  }

  const handleRemoveFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter((t) => t !== ticker))
    const stock = stocks.find((s) => s.ticker === ticker)
    toast({
      title: 'Removed from Watchlist',
      description: `${stock?.name || ticker} has been removed.`,
      variant: 'destructive',
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">My Watchlist</h1>
        <div className="flex gap-2">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Add a stock to watch" />
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
            <PlusCircle className="mr-2 h-4 w-4" /> Add
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
            Your watchlist is empty
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add stocks using the dropdown above to track them here.
          </p>
        </div>
      )}
    </div>
  )
}
