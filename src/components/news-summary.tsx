import { summarizeStockNews } from '@/ai/flows/summarize-stock-news'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { newsArticles, stocks } from '@/lib/data'
import { Skeleton } from './ui/skeleton'
import { Suspense } from 'react'
import { Newspaper } from 'lucide-react'

async function NewsSummaryContent({ ticker }: { ticker: string }) {
  const articles = newsArticles[ticker]
  const stock = stocks.find((s) => s.ticker === ticker)

  if (!articles || articles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        لا توجد أخبار حديثة لـ {stock?.name || ticker}.
      </p>
    )
  }

  try {
    const { summary } = await summarizeStockNews({
      ticker,
      newsArticles: articles,
    })

    return (
      <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
    )
  } catch (e) {
    console.error(e)
    return <p className="text-sm text-destructive">تعذر تحميل ملخص الأخبار.</p>
  }
}

export function NewsSummary({ ticker }: { ticker: string }) {
  const stock = stocks.find((s) => s.ticker === ticker)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Newspaper className="w-5 h-5 text-primary" />
          أخبار: {stock?.name || ticker}
        </CardTitle>
        <CardDescription>ملخص إخباري مدعوم بالذكاء الاصطناعي.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
          <NewsSummaryContent ticker={ticker} />
        </Suspense>
      </CardContent>
    </Card>
  )
}
