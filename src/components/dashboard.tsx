
'use client'

import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import Link from 'next/link'
import { onWatchlistUpdate, onStrategiesUpdate, onPortfoliosUpdate, type SavedStrategy, type PortfolioDetails } from '@/lib/firestore'
import { AssetCard } from '@/components/stock-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ArrowLeft, LayoutDashboard, Lightbulb, Newspaper, Briefcase, PlusCircle, FolderKanban, Wand2 } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { type Asset, getAllStocks } from '@/lib/stocks'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<Asset[]>([])
  const [portfolios, setPortfolios] = useState<PortfolioDetails[]>([])
  const [strategies, setStrategies] = useState<SavedStrategy[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
        setLoading(false);
        return;
    };

    let active = true;
    
    // Fetch all stocks once and build a lookup map
    const stockMap = new Map<string, Asset>();
    getAllStocks().then(allStocks => {
        if (!active) return;
        allStocks.forEach(stock => stockMap.set(stock.ticker, stock));

        // Now setup listeners
        const unsubWatchlist = onWatchlistUpdate(user.uid, (tickers) => {
            if (!active) return;
            setWatchlistTickers(tickers);
            const assetsInList = tickers.map(ticker => stockMap.get(ticker)).filter(Boolean) as Asset[];
            setWatchlist(assetsInList);
        });

        const unsubPortfolios = onPortfoliosUpdate(user.uid, (portfolios) => {
            if (active) setPortfolios(portfolios);
        });
        
        const unsubStrategies = onStrategiesUpdate(user.uid, (strategies) => {
          if (active) setStrategies(strategies);
        });
        
        // Initial data loaded
        if(active) setLoading(false);

        // Cleanup function
        return () => {
          active = false;
          unsubWatchlist?.();
          unsubPortfolios?.();
          unsubStrategies?.();
        };
    });

    return () => { active = false }; // Cleanup for the outer effect
  }, [user?.uid]);
  
  const latestPortfolio = portfolios.length > 0 ? portfolios[0] : null;
  const latestStrategy = strategies.length > 0 ? strategies[0] : null;


  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold font-headline">
        أهلاً بعودتك، {user.displayName || 'مستثمرنا العزيز'}!
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>نظرة على المحفظة</CardTitle>
                <CardDescription>ملخص سريع لآخر محفظة استثمارية لك.</CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href="/portfolios">
                  عرض كل المحافظ <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {latestPortfolio ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{latestPortfolio.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    آخر تحديث في: {new Date(latestPortfolio.updatedAt).toLocaleString('ar-EG')}
                  </p>
                   <Button asChild variant="secondary" className="w-full md:w-auto">
                    <Link href={`/portfolio/${latestPortfolio.id}`}>
                      عرض تفاصيل المحفظة <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-4">
                  <Briefcase className="w-10 h-10"/>
                  <p>ليس لديك أي محافظ بعد. ابدأ بإنشاء واحدة.</p>
                  <Button asChild>
                    <Link href="/portfolios"><PlusCircle className="ml-2"/> إنشاء محفظة</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchlist.slice(0, 2).map(asset => (
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
        </div>

        <div className="space-y-8">
           <Card>
            <CardHeader>
                <CardTitle>آخر خطة استثمارية</CardTitle>
                <CardDescription>ملخص سريع لآخر استراتيجية قمت بإنشائها.</CardDescription>
            </CardHeader>
            <CardContent>
              {latestStrategy ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{latestStrategy.strategyTitle}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {latestStrategy.strategySummary}
                  </p>
                   <Button asChild variant="secondary" className="w-full">
                    <Link href="/strategies">
                      عرض كل الخطط <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
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

          <Card>
            <CardHeader>
              <CardTitle>أدوات الذكاء الاصطناعي</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button asChild size="lg">
                <Link href="/guide"><Lightbulb className="ml-2 h-4 w-4" /> أنشئ خطة استثمار</Link>
              </Button>
               <Button asChild size="lg" variant="secondary">
                <Link href="/analysis"><Wand2 className="ml-2 h-4 w-4" /> استخدم المحلل الذكي</Link>
              </Button>
               <Button asChild size="lg" variant="secondary">
                <Link href="/portfolios"><FolderKanban className="ml-2 h-4 w-4" /> إدارة المحافظ</Link>
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
    <div className="container mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      <Skeleton className="h-9 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-56 mt-2" />
                </div>
                <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
               <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Skeleton className="h-12 w-full" />
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
