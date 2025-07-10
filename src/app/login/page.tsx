'use client'

import { useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { signIn } from '@/lib/auth'
import { Loader2, Terminal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { isFirebaseConfigured } from '@/lib/firebase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  email: z.string().email('الرجاء إدخال بريد إلكتروني صالح.'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showConfigWarning, setShowConfigWarning] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    setIsClient(true)
    if (!isFirebaseConfigured) {
        setShowConfigWarning(true);
    }
  }, [])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true)
    setAuthError(null);
    try {
      await signIn(data.email, data.password)
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بعودتك!',
      })
      router.push('/watchlist')
    } catch (error: any) {
      console.error(error)
      let description = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
      let showErrorToast = true;

      if (error.code) {
        switch (error.code) {
            case 'auth/invalid-credential':
                description = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
                break;
            case 'auth/configuration-not-found':
                setAuthError('تهيئة Firebase غير صحيحة. يرجى التأكد من تمكين تسجيل الدخول بالبريد الإلكتروني/كلمة المرور في لوحة تحكم Firebase.');
                showErrorToast = false;
                break;
        }
      } else if (error.message.includes('Firebase is not configured')) {
        description = 'مفاتيح Firebase API غير موجودة أو غير صالحة. يرجى التحقق من ملف .env الخاص بك.'
      }

      if (showErrorToast) {
        toast({
            title: 'خطأ في تسجيل الدخول',
            description,
            variant: 'destructive',
        })
      }
    }
    setLoading(false)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (showConfigWarning) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">تهيئة Firebase ناقصة</CardTitle>
                    <CardDescription>
                       يبدو أن متغيرات البيئة الخاصة بـ Firebase غير مهيأة بشكل صحيح في ملف `.env` الخاص بك.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">
                        لاستخدام ميزات المصادقة، تحتاج إلى نسخ إعدادات Firebase الخاصة بك ولصقها في ملف `.env` في جذر مشروعك. تأكد من أن جميع المتغيرات التي تبدأ بـ `NEXT_PUBLIC_FIREBASE_` لها قيم من لوحة تحكم Firebase.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <div className="w-full max-w-sm space-y-6">
            {authError && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>خطأ في التهيئة</AlertTitle>
                <AlertDescription>
                    {authError}
                    <p className="mt-2 text-xs">
                        اذهب إلى <strong>Build &gt; Authentication &gt; Sign-in method</strong> في لوحة تحكم Firebase الخاصة بك وقم بتمكين <strong>Email/Password</strong>.
                    </p>
                </AlertDescription>
              </Alert>
            )}
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
                    <CardDescription>
                    أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register('email')}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                    ليس لديك حساب؟{' '}
                    <Link href="/register" className="underline">
                        إنشاء حساب
                    </Link>
                    </div>
                </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  )
}
