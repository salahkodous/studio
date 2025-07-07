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
import { signUp } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { isFirebaseConfigured } from '@/lib/firebase'

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم من حرفين على الأقل.'),
  email: z.string().email('الرجاء إدخال بريد إلكتروني صالح.'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showConfigWarning, setShowConfigWarning] = useState(false);
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
    try {
      await signUp(data.email, data.password, data.name)
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'تم تسجيل دخولك.',
      })
      router.push('/watchlist')
    } catch (error: any) {
      console.error(error)
      let description = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
      if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                description = 'هذا البريد الإلكتروني مستخدم بالفعل.';
                break;
            case 'auth/configuration-not-found':
                description = 'تهيئة Firebase غير صحيحة. يرجى التأكد من تمكين تسجيل الدخول بالبريد الإلكتروني/كلمة المرور في لوحة تحكم Firebase.';
                break;
            case 'auth/invalid-credential':
                description = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
                break;
        }
      } else if (error.message.includes('Firebase is not configured')) {
        description = 'مفاتيح Firebase API غير موجودة أو غير صالحة. يرجى التحقق من ملف .env الخاص بك.'
      }

      toast({
        title: 'خطأ في إنشاء الحساب',
        description,
        variant: 'destructive',
      })
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
                    <CardTitle className="text-2xl text-destructive">تهيئة ناقصة</CardTitle>
                    <CardDescription>
                       مفاتيح Firebase API غير موجودة أو غير صالحة. يرجى التحقق من ملف .env الخاص بك.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">
                        تأكد من أنك قمت بنسخ جميع المتغيرات من إعدادات مشروع Firebase ولصقها في ملف .env الخاص بك.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">إنشاء حساب</CardTitle>
            <CardDescription>أنشئ حسابًا للبدء.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" placeholder="أحمد الفارسي" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
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
              {loading ? <Loader2 className="animate-spin" /> : 'إنشاء حساب'}
            </Button>
            <div className="mt-4 text-center text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
