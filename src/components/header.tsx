'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { logOut } from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from './logo'

const navItems = [
  { href: '/', label: 'الرئيسية' },
  { href: '/guide', label: 'دليل الاستثمار' },
  { href: '/analysis', label: 'المحلل الذكي' },
  { href: '/watchlist', label: 'قائمة المتابعة', auth: true },
  { href: '/portfolios', label: 'المحافظ', auth: true },
  { href: '/strategies', label: 'خططي الاستثمارية', auth: true },
  { href: '/news', label: 'أخبار السوق' },
];

export function Header() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  const visibleNavItems = navItems.filter(item => !item.auth || (item.auth && user));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left Side: Desktop Nav / Mobile Menu */}
        <div className="flex items-center">
          {/* Desktop Nav */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block font-headline">
                ثروات
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname === item.href || (item.href === '/portfolios' && pathname.startsWith('/portfolio/')) ? 'text-foreground' : 'text-foreground/60'
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
              <SheetHeader>
                <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
              </SheetHeader>
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">
                  ثروات
                </span>
              </Link>
              <div className="mt-6 flex flex-col space-y-4 text-lg">
                {visibleNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'transition-colors hover:text-foreground/80',
                        pathname === item.href || (item.href === '/portfolios' && pathname.startsWith('/portfolio/')) ? 'text-foreground font-semibold' : 'text-foreground/80'
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo (in the middle) */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center">
            <Logo className="h-6 w-6 text-primary" />
            <span className="sr-only">Home</span>
          </Link>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center justify-end space-x-2">
          {loading ? (
             <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link href="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

    