'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Mountain } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'الرئيسية' },
  { href: '/guide', label: 'دليل الاستثمار' },
  { href: '/watchlist', label: 'قائمة المتابعة' },
  { href: '/news', label: 'أخبار السوق' },
];

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left Side: Desktop Nav / Mobile Menu */}
        <div className="flex items-center">
          {/* Desktop Nav */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Mountain className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block font-headline">
                تحليلات جلف ستريم
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Mountain className="h-6 w-6" />
                <span className="font-bold font-headline">
                  تحليلات جلف ستريم
                </span>
              </Link>
              <div className="mt-6 flex flex-col space-y-4 text-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground/80',
                      pathname === item.href ? 'text-foreground font-semibold' : 'text-foreground/80'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo (in the middle) */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center">
            <Mountain className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center justify-end space-x-2">
          <Button asChild variant="ghost">
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="/register">إنشاء حساب</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
