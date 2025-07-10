'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { onStrategiesUpdate, type SavedStrategy } from '@/lib/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, PieChart as PieChartIcon, Archive } from 'lucide-react'
import type { ChartConfig } from '@/components/ui/chart'

const StrategyPieChart = dynamic(
  () => import('@/components/strategy-pie-chart').then((mod) => mod.StrategyPieChart),
  {
    loading: () => <Skeleton className="mx-auto aspect-square h-[250px] rounded-full" />,
    ssr: false
  }
);


export default function StrategiesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [strategies, setStrategies] = useState<SavedStrategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const unsubscribe = onStrategiesUpdate(user.uid, (userStrategies) => {
        setStrategies(userStrategies)
        setLoading(false)
      })
      return () => unsubscribe?.()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">خططي الاستثمارية</h1>
        <p className="text-lg text-muted-foreground mt-2">
          هنا تجد جميع استراتيجيات الاستثمار التي أنشأتها وحفظتها.
        </p>
      </div>

      {strategies.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {strategies.map((strategy) => (
            <AccordionItem value={strategy.id} key={strategy.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-6 text-lg hover:no-underline">
                <div className="flex flex-col text-right items-start">
                    <span>{strategy.strategyTitle}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        تم الإنشاء في: {new Date(strategy.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <StrategyDetails strategy={strategy} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-muted-foreground">
            لا توجد خطط محفوظة
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            اذهب إلى صفحة <a href="/guide" className="underline text-primary">دليل الاستثمار</a> لإنشاء أول خطة لك.
          </p>
        </div>
      )}
    </div>
  )
}

function StrategyDetails({ strategy }: { strategy: SavedStrategy }) {
    const chartData = useMemo(() => strategy?.assetAllocation ?? [], [strategy]);
    const chartConfig = useMemo(() => (chartData.reduce((acc, curr, index) => {
        const key = curr.category.replace(/[^a-zA-Z0-9]/g, "");
        acc[key] = {
        label: curr.category,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {} as ChartConfig)), [chartData]);

    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">{strategy.strategySummary}</p>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                توزيع الأصول المقترح
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="grid gap-3 text-sm">
                    {strategy.assetAllocation.map((asset, index) => (
                      <div key={asset.category} className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{
                            backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between font-medium">
                            <span>{asset.category}</span>
                            <span>{asset.percentage}%</span>
                          </div>
                          <p className="text-muted-foreground">{asset.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 md:order-2 h-[250px] flex items-center justify-center">
                   <StrategyPieChart chartData={chartData} chartConfig={chartConfig} />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">توصيات الخبراء</h3>
               <div className="space-y-4">
                {strategy.recommendations.map((rec) => (
                  <div key={rec.ticker} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-bold">{rec.name} <span className="text-xs text-muted-foreground">{rec.ticker}</span></p>
                      <p className="text-sm text-muted-foreground">{rec.justification}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
             <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                تحليل المخاطر
              </h3>
              <p className="text-sm text-muted-foreground">{strategy.riskAnalysis}</p>
            </div>
        </div>
    )
}


function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  )
}
