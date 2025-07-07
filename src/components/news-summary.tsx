'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { newsArticles, stocks } from '@/lib/data'
import { BookOpen, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { summarizeNews } from '@/ai/flows/summarize-stock-news'
import { useToast } from '@/hooks/use-toast'
import { Button } from './ui/button'

interface NewsSummaryProps {
  ticker: string
}

export function NewsSummary({ ticker }: NewsSummaryProps) {
  const stock = stocks.find((s) => s.ticker === ticker)
  const articles = newsArticles[ticker] || []

  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSummarize = async () => {
    if (!stock || articles.length === 0) return
    setLoading(true)
    setSummary(null)
    try {
      const result = await summarizeNews({ ticker: stock.ticker })
      setSummary(result.summary)
    } catch (error) {
      console.error('Error summarizing news:', error)
      toast({
        title: 'خطأ في التلخيص',
        description: 'لم نتمكن من تلخيص الأخبار. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  if (!stock) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center justify-between">
          <span>أخبار عن {stock.name}</span>
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center space-x-2 space-x-reverse text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري تلخيص الأخبار...</span>
          </div>
        ) : summary ? (
          <div className="space-y-3 p-3 bg-secondary rounded-md">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-semibold">ملخص بالذكاء الاصطناعي</h4>
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        ) : articles.length > 0 ? (
          <Button onClick={handleSummarize} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            تلخيص الأخبار بالذكاء الاصطناعي
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد أخبار حديثة لهذا السهم.
          </p>
        )}

        {articles.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-sm">المصادر</h4>
            <ul className="space-y-2 list-disc pr-5">
              {articles.map((url, index) => (
                <li key={index} className="text-sm">
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {`خبر ${index + 1} عن ${stock.ticker}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
