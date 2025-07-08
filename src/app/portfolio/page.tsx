'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AssetCard } from '@/components/stock-card'
import { assets } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { onPortfolioUpdate, removeFromPortfolio } from '@/lib/firestore'
import { Briefcase, Trash2 } from 'lucide-react'

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<string[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const unsubscribe = onPortfolioUpdate(user.uid, (userPortfolio) => {
        setPortfolio(userPortfolio)
        if (isInitialLoad) setIsInitialLoad(false)
      })
      return () => unsubscribe?.()
    } else if (!authLoading) {
      setIsInitialLoad(false)
    }
  }, [user, authLoading, isInitialLoad])

  const portfolioAssets = useMemo(() => {
    return assets.filter((asset) => portfolio.includes(asset.ticker))
  }, [portfolio])

  const handleRemoveFromPortfolio = useCallback(async (ticker: string) => {
    if (user) {
      try {
        await removeFromPortfolio(user.uid, ticker)
        const asset = assets.find((s) => s.ticker === ticker)
        toast({
          title: 'تمت الإزالة من المحفظة',
          description: `${asset?.name || ticker} تمت إزالته.`,
          variant: 'destructive',
           icon: <Trash2 className="h-5 w-5" />,
        })
      } catch (error) {
        console.error('Failed to remove from portfolio:', error)
        toast({
          title: 'خطأ',
          description: 'لم نتمكن من إزالة الأصل. الرجاء المحاولة مرة أخرى.',
          variant: 'destructive',
        })
      }
    }
  }, [user, toast]);

  if (authLoading || isInitialLoad) {
    return <PageSkeleton />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">محفظتي الاستثمارية</h1>
        <p className="text-lg text-muted-foreground mt-2">
            تابع أداء الأصول التي استثمرت فيها.
        </p>
      </div>

      {portfolioAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioAssets.map((asset) => (
            <AssetCard
              key={asset.ticker}
              asset={asset}
              onRemove={handleRemoveFromPortfolio}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
           <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-muted-foreground">
            محفظتك فارغة
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            اذهب إلى صفحة <a href="/guide" className="underline text-primary">دليل الاستثمار</a> لإنشاء خطة وإضافة أصول.
          </p>
        </div>
      )}
    </div>
  )
}

function PageSkeleton() {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3 bg-card">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-2/4" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}
