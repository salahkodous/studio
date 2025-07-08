'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AssetCard } from '@/components/stock-card'
import { assets, type Asset } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { onWatchlistUpdate, addToWatchlist, removeFromWatchlist } from '@/lib/firestore'

type Category = 'Stocks' | 'Gold' | 'Oil' | 'Bonds'
const categories: { id: Category; name: string }[] = [
  { id: 'Stocks', name: 'الأسهم' },
  { id: 'Gold', name: 'الذهب' },
  { id: 'Oil', name: 'النفط' },
  { id: 'Bonds', name: 'السندات' },
]

type Country = 'All' | 'SA' | 'QA' | 'AE'
const countries: { id: Country; name: string }[] = [
  { id: 'All', name: 'الكل' },
  { id: 'SA', name: 'السعودية' },
  { id: 'QA', name: 'قطر' },
  { id: 'AE', name: 'الإمارات' },
]

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('Stocks')
  const [activeCountry, setActiveCountry] = useState<Country>('All')
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const unsubscribe = onWatchlistUpdate(user.uid, (userWatchlist) => {
        setWatchlist(userWatchlist)
        setIsInitialLoad(false)
      })
      return () => unsubscribe?.()
    }
  }, [user])

  const watchlistAssets = useMemo(() => {
    return assets.filter((asset) => watchlist.includes(asset.ticker))
  }, [watchlist])

  const availableAssets = useMemo(() => {
    return assets.filter((asset) => !watchlist.includes(asset.ticker))
  }, [watchlist])
  
  const availableAssetsGrouped = useMemo(() => {
    return availableAssets.reduce((acc, asset) => {
        const category = categories.find(c => c.id === asset.category)?.name || 'غير مصنف';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);
  }, [availableAssets]);

  const filteredAssets = useMemo(() => {
    return watchlistAssets.filter(asset => {
        const categoryMatch = asset.category === activeCategory
        const countryMatch = activeCategory !== 'Stocks' || activeCountry === 'All' || asset.country === activeCountry
        return categoryMatch && countryMatch
    })
  }, [watchlistAssets, activeCategory, activeCountry]);

  const handleAddToWatchlist = useCallback(async () => {
    if (user && selectedAsset && !watchlist.includes(selectedAsset)) {
      const assetToAdd = selectedAsset
      setSelectedAsset('')
      try {
        await addToWatchlist(user.uid, assetToAdd)
        const asset = assets.find((s) => s.ticker === assetToAdd)
        toast({
          title: 'أضيف إلى قائمة المتابعة',
          description: `${asset?.name || assetToAdd} تمت إضافته.`,
        })
      } catch (error) {
        console.error('Failed to add to watchlist:', error)
        toast({
          title: 'خطأ',
          description: 'لم نتمكن من إضافة الأصل. الرجاء المحاولة مرة أخرى.',
          variant: 'destructive',
        })
      }
    }
  }, [user, selectedAsset, watchlist, toast]);

  const handleRemoveFromWatchlist = useCallback(async (ticker: string) => {
    if (user) {
      try {
        await removeFromWatchlist(user.uid, ticker)
        const asset = assets.find((s) => s.ticker === ticker)
        toast({
          title: 'تمت الإزالة من قائمة المتابعة',
          description: `${asset?.name || ticker} تمت إزالته.`,
          variant: 'destructive',
        })
      } catch (error) {
        console.error('Failed to remove from watchlist:', error)
        toast({
          title: 'خطأ',
          description: 'لم نتمكن من إزالة الأصل. الرجاء المحاولة مرة أخرى.',
          variant: 'destructive',
        })
      }
    }
  }, [user, toast]);

  if (authLoading || isInitialLoad) {
    return <LoadingSkeleton />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">قائمة المتابعة</h1>
        <div className="flex gap-2">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="أضف أصلاً للمتابعة" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(availableAssetsGrouped).map(([group, assets]) => (
                    <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {assets.map((asset) => (
                           <SelectItem key={asset.ticker} value={asset.ticker}>
                             {asset.name} ({asset.ticker})
                           </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddToWatchlist} disabled={!selectedAsset}>
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {categories.map(cat => (
            <Button 
                key={cat.id} 
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat.id)}
            >
                {cat.name}
            </Button>
        ))}
      </div>

      {activeCategory === 'Stocks' && (
        <div className="flex flex-wrap gap-2 mb-8">
            <span className="self-center text-sm font-medium text-muted-foreground">الدولة:</span>
            {countries.map(country => (
                <Button
                    key={country.id}
                    variant={activeCountry === country.id ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveCountry(country.id)}
                >
                    {country.name}
                </Button>
            ))}
        </div>
      )}


      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.ticker}
              asset={asset}
              onRemove={handleRemoveFromWatchlist}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-muted-foreground">
            لا توجد أصول في هذه الفئة
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            أضف أصولاً من هذه الفئة لمتابعتها هنا.
          </p>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-60" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
         <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
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
