'use client'

import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import Link from 'next/link'
import { onWatchlistUpdate, onStrategiesUpdate, type SavedStrategy } from '@/lib/firestore'
import { assets } from '@/lib/data'
import type { Asset } from '@/lib/data'
import { AssetCard } from '@/components/stock-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ArrowLeft, LayoutDashboard, Lightbulb, Newspaper } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [watchlist, setWatchlist] = useState<Asset[]>([])
  const [latestStrategy, setLatestStrategy] = useState<SavedStrategy | null>(null)
  const [watchlistLoading, setWatchlistLoading] = useState(true)
  const [strategyLoading, setStrategyLoading] = useState(true)

  useEffect(() => {
    if (!user.uid) return;

    setWatchlistLoading(true);
    setStrategyLoading(true);

    const unsubscribeWatchlist = onWatchlistUpdate(user.uid, (watchlistTickers) => {
      const watchlistAssets = assets.filter(asset => watchlistTickers.includes(asset.ticker));
      setWatchlist(watchlistAssets);
      setWatchlistLoading(false);
    });

    const unsubscribeStrategies = onStrategiesUpdate(user.uid, (strategies) => {
      setLatestStrategy(strategies.length > 0 ? strategies[0] : null);
      setStrategyLoading(false);
    });

    return () => {
      unsubscribeWatchlist?.();
      unsubscribeStrategies?.();
    };
  }, [user.uid]);

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold font-headline">
        أهلاً بعودتك، {user.displayName || 'مستثمرنا العزيز'}!
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>نظرة على قائمة المتابعة</CardTitle>
                <CardDescription>أحدث أداء لأصولك المختارة.</CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href="/watchlist">
                  عرض الكل <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {watchlistLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchlist.slice(0, 4).map(asset => (
                    <AssetCard key={asset.ticker} asset={asset} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>قائمة المتابعة فارغة.</p>
                  <Button asChild variant="link">
                    <Link href="/watchlist">أضف بعض الأصول الآن</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                <CardTitle>آخر خطة استثمارية</CardTitle>
                <CardDescription>ملخص سريع لأحدث استراتيجية قمت بإنشائها.</CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href="/strategies">
                  عرض كل الخطط <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {strategyLoading ? (
                 <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ) : latestStrategy ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{latestStrategy.strategyTitle}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {latestStrategy.strategySummary}
                  </p>
                </div>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                  <p>لم تقم بإنشاء أي خطط بعد.</p>
                   <Button asChild variant="link">
                    <Link href="/guide">أنشئ خطتك الأولى</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>روابط سريعة</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button asChild size="lg">
                <Link href="/guide"><Lightbulb className="ml-2 h-4 w-4" /> أنشئ خطة جديدة</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/watchlist"><LayoutDashboard className="ml-2 h-4 w-4" /> إدارة قائمة المتابعة</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/news"><Newspaper className="ml-2 h-4 w-4" /> تصفح أخبار السوق</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


function DashboardSkeleton() {
  return (
     <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
      <Skeleton className="h-9 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
