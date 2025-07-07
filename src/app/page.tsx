'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Dashboard } from '@/components/dashboard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
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

  if (!user) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-[calc(100vh-8rem)] p-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 md:text-right">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
              دليلك الشامل للاستثمار في الخليج
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              احصل على استراتيجيات استثمار مخصصة لأهدافك وميزانيتك، مدعومة بالذكاء الاصطناعي لتحليل أسواق الأسهم، العقارات، الذهب، وغيرها في منطقة الخليج.
            </p>
            <Button asChild size="lg">
              <Link href="/guide">
                ابدأ الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2">
             <Image
              src="https://placehold.co/600x400.png"
              alt="Investment Dashboard"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
              data-ai-hint="investment finance"
            />
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}
