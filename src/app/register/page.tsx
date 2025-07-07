'use client'

import { useState } from 'react'
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

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم من حرفين على الأقل.'),
  email: z.string().email('الرجاء إدخال بريد إلكتروني صالح.'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

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
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message === 'Firebase: Error (auth/email-already-in-use).' 
          ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
          : 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    }
    setLoading(false)
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
