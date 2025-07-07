import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Mountain } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block font-headline">
              تحليلات جلف ستريم
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              لوحة التحكم
            </Link>
            <Link
              href="/watchlist"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              قائمة المتابعة
            </Link>
            <Link
              href="/news"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              الأخبار
            </Link>
          </nav>
        </div>

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
              <Link href="/">لوحة التحكم</Link>
              <Link href="/watchlist">قائمة المتابعة</Link>
              <Link href="/news">الأخبار</Link>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-end space-x-2">
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
