'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { newsArticles, stocks } from '@/lib/data'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

interface NewsSummaryProps {
  ticker: string
}

export function NewsSummary({ ticker }: NewsSummaryProps) {
  const stock = stocks.find((s) => s.ticker === ticker)
  const articles = newsArticles[ticker] || []

  if (!stock) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center justify-between">
          <span>أخبار عن {stock.name}</span>
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length > 0 ? (
          <ul className="space-y-3">
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
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد أخبار حديثة لهذا السهم.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
