import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
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
