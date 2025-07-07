import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'GulfStream Analytics',
  description: 'Simple Gulf Stock Analysis App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
