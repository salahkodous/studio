import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/hooks/use-auth'
import { Tajawal } from 'next/font/google'

export const metadata: Metadata = {
  title: 'ثروات',
  description: 'بوابتك الذكية للاستثمار في الخليج',
}

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-tajawal',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn("dark", tajawal.variable)} suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
