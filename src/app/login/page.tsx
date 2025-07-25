
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
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const formSchema = z.object({
  email: z.string().email('الرجاء إدخال بريد إلكتروني صالح.'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
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
  }, [])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بعودتك!',
      })
      router.push('/')
    } catch (error: any) {
      console.error(error)
      let description = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';

      if (error.code) {
        switch (error.code) {
            case 'auth/invalid-credential':
                description = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
                break;
            case 'auth/user-not-found':
                description = 'لم يتم العثور على حساب بهذا البريد الإلكتروني.';
                break;
            case 'auth/wrong-password':
                description = 'كلمة المرور غير صحيحة.';
                break;
             default:
                description = `حدث خطأ أثناء تسجيل الدخول: ${error.message}`;
        }
      }

      toast({
          title: 'خطأ في تسجيل الدخول',
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
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <div className="w-full max-w-sm space-y-6">
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
