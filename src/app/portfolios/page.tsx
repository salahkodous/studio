// This is a new file for listing all user portfolios.
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { onPortfoliosUpdate, createPortfolio, deletePortfolio, type PortfolioDetails } from '@/lib/firestore'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2, Briefcase, ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const portfolioSchema = z.object({
  name: z.string().min(3, "اسم المحفظة يجب أن يكون 3 أحرف على الأقل.").max(50, "اسم المحفظة طويل جدًا."),
})

type PortfolioFormValues = z.infer<typeof portfolioSchema>

export default function PortfoliosPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [portfolios, setPortfolios] = useState<PortfolioDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setCreateOpen] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PortfolioFormValues>({
        resolver: zodResolver(portfolioSchema)
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            const unsubscribe = onPortfoliosUpdate(user.uid, (data) => {
                setPortfolios(data)
                setLoading(false)
            })
            return () => unsubscribe?.()
        }
    }, [user])

    const handleCreatePortfolio = async (data: PortfolioFormValues) => {
        if (!user) return;
        try {
            await createPortfolio(user.uid, data.name);
            toast({ title: "تم إنشاء المحفظة", description: `تم إنشاء محفظة "${data.name}" بنجاح.` });
            reset();
            setCreateOpen(false);
        } catch (error) {
            console.error("Error creating portfolio:", error);
            toast({ title: "خطأ", description: "فشل في إنشاء المحفظة. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
        }
    }
    
    const handleDeletePortfolio = async (portfolioId: string) => {
        if (!user) return;
        try {
            await deletePortfolio(user.uid, portfolioId);
            toast({ title: "تم حذف المحفظة", description: "تم حذف المحفظة بنجاح.", variant: 'destructive' });
        } catch (error) {
            console.error("Error deleting portfolio:", error);
            toast({ title: "خطأ", description: "فشل في حذف المحفظة. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
        }
    }

    if (loading || authLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">محافظي الاستثمارية</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        أنشئ وتابع محافظك الاستثمارية المتعددة من هنا.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="ml-2" />
                            إنشاء محفظة جديدة
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit(handleCreatePortfolio)}>
                            <DialogHeader>
                                <DialogTitle>إنشاء محفظة جديدة</DialogTitle>
                                <DialogDescription>
                                    أعطِ اسمًا مميزًا لمحفظتك الجديدة للبدء.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        الاسم
                                    </Label>
                                    <Input
                                        id="name"
                                        className="col-span-3"
                                        {...register('name')}
                                    />
                                    {errors.name && <p className="col-span-4 text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">إنشاء</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            {portfolios.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.map(p => (
                        <Card key={p.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span className="font-bold font-headline text-xl">{p.name}</span>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    سيتم حذف محفظة "{p.name}" وجميع الأصول بداخلها بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeletePortfolio(p.id)} className="bg-destructive hover:bg-destructive/90">
                                                    نعم، احذف المحفظة
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardTitle>
                                <CardDescription>
                                    تم الإنشاء في: {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="flex-grow flex items-end">
                                <Button asChild className="w-full">
                                    <Link href={`/portfolio/${p.id}`}>
                                        عرض التفاصيل <ChevronLeft className="mr-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold text-muted-foreground">
                        ليس لديك أي محافظ بعد
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        ابدأ بإنشاء محفظتك الأولى لتتبع استثماراتك.
                    </p>
                </div>
            )}
        </div>
    )
}

function PageSkeleton() {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
}

function CardSkeleton() {
    return (
        <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
        </Card>
    )
}