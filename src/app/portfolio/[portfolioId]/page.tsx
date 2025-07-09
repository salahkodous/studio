// This is a new file for displaying a single, detailed portfolio.
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { getPortfolio, onPortfolioAssetsUpdate, removeAssetFromPortfolio, addAssetToPortfolio, type PortfolioAsset, type PortfolioDetails } from '@/lib/firestore'
import { assets, type Asset } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, Minus, BarChart, ShoppingCart, DollarSign, TrendingUp, AlertCircle, PackageOpen } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'

const addAssetSchema = z.object({
    ticker: z.string().min(1, "الرجاء اختيار أصل."),
    quantity: z.coerce.number().min(0.0001, "الكمية يجب أن تكون أكبر من صفر."),
    purchasePrice: z.coerce.number().min(0.01, "سعر الشراء يجب أن يكون أكبر من صفر."),
})

type AddAssetFormValues = z.infer<typeof addAssetSchema>

export default function PortfolioDetailPage({ params }: { params: { portfolioId: string } }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const portfolioId = params.portfolioId

    const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(null)
    const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddAssetOpen, setAddAssetOpen] = useState(false)
    
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<AddAssetFormValues>({
        resolver: zodResolver(addAssetSchema)
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && portfolioId) {
            const fetchDetails = async () => {
                const details = await getPortfolio(user.uid, portfolioId);
                if (details) {
                    setPortfolioDetails(details);
                } else {
                    toast({ title: "المحفظة غير موجودة", description: "لم نتمكن من العثور على هذه المحفظة.", variant: 'destructive' })
                    router.push('/portfolios');
                }
            }
            fetchDetails();

            const unsubscribe = onPortfolioAssetsUpdate(user.uid, portfolioId, (assets) => {
                setPortfolioAssets(assets);
                setLoading(false);
            });

            return () => unsubscribe?.();
        }
    }, [user, portfolioId, router, toast])
    
    const availableAssets = useMemo(() => {
        const currentTickers = portfolioAssets.map(a => a.ticker);
        return assets.filter(asset => !currentTickers.includes(asset.ticker));
    }, [portfolioAssets]);

    const availableAssetsGrouped = useMemo(() => {
        return availableAssets.reduce((acc, asset) => {
            if (!acc[asset.category]) {
                acc[asset.category] = [];
            }
            acc[asset.category].push(asset);
            return acc;
        }, {} as Record<string, Asset[]>);
    }, [availableAssets]);

    const handleAddAsset = async (data: AddAssetFormValues) => {
        if (!user) return;
        try {
            await addAssetToPortfolio(user.uid, portfolioId, {
                ticker: data.ticker,
                quantity: data.quantity,
                purchasePrice: data.purchasePrice,
            });
            toast({ title: "تمت إضافة الأصل", description: `تمت إضافة ${data.ticker} إلى محفظتك بنجاح.` });
            reset();
            setAddAssetOpen(false);
        } catch (error) {
            console.error("Error adding asset:", error);
            toast({ title: "خطأ", description: "فشل في إضافة الأصل. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
        }
    }
    
    const handleRemoveAsset = async (assetId: string) => {
         if (!user) return;
        try {
            await removeAssetFromPortfolio(user.uid, portfolioId, assetId);
            toast({ title: "تم حذف الأصل", description: "تم حذف الأصل من المحفظة بنجاح.", variant: 'destructive' });
        } catch (error) {
            console.error("Error removing asset:", error);
            toast({ title: "خطأ", description: "فشل في حذف الأصل. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
        }
    }
    
    const enrichedAssets = useMemo(() => {
        return portfolioAssets.map(pa => {
            const assetDetails = assets.find(a => a.ticker === pa.ticker);
            if (!assetDetails) return null;

            const purchaseValue = pa.quantity * pa.purchasePrice;
            const currentValue = pa.quantity * assetDetails.price;
            const change = currentValue - purchaseValue;
            const changePercent = purchaseValue > 0 ? (change / purchaseValue) * 100 : 0;
            
            return {
                ...pa,
                ...assetDetails,
                purchaseValue,
                currentValue,
                change,
                changePercent,
            }
        }).filter(Boolean);
    }, [portfolioAssets]);

    const totals = useMemo(() => {
        return enrichedAssets.reduce((acc, asset) => {
            if (asset) {
                acc.totalPurchaseValue += asset.purchaseValue;
                acc.totalCurrentValue += asset.currentValue;
            }
            return acc;
        }, { totalPurchaseValue: 0, totalCurrentValue: 0 });
    }, [enrichedAssets]);
    
    const totalChange = totals.totalCurrentValue - totals.totalPurchaseValue;
    const totalChangePercent = totals.totalPurchaseValue > 0 ? (totalChange / totals.totalPurchaseValue) * 100 : 0;


    if (loading) {
        return <PageSkeleton />;
    }

    if (!portfolioDetails) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <Card className="text-center py-20">
                     <CardHeader>
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive"/>
                        <CardTitle>المحفظة غير موجودة</CardTitle>
                        <CardDescription>قد تكون حذفت أو أن الرابط غير صحيح.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <a href="/portfolios">العودة إلى قائمة المحافظ</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-headline">{portfolioDetails.name}</h1>
                    <p className="text-muted-foreground">تم الإنشاء في: {new Date(portfolioDetails.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                 <Dialog open={isAddAssetOpen} onOpenChange={setAddAssetOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="ml-2" />
                            إضافة أصل جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                         <form onSubmit={handleSubmit(handleAddAsset)}>
                            <DialogHeader>
                                <DialogTitle>إضافة أصل إلى المحفظة</DialogTitle>
                                <DialogDescription>
                                    اختر أصلاً وأدخل الكمية وسعر الشراء.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ticker" className="text-right">الأصل</Label>
                                    <Controller
                                        name="ticker"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="اختر أصلاً" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(availableAssetsGrouped).map(([category, assetsInCategory]) => (
                                                        <SelectGroup key={category}>
                                                            <SelectLabel>{category}</SelectLabel>
                                                            {assetsInCategory.map(asset => (
                                                                <SelectItem key={asset.ticker} value={asset.ticker}>{asset.name}</SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.ticker && <p className="col-span-4 text-sm text-destructive">{errors.ticker.message}</p>}
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="quantity" className="text-right">الكمية</Label>
                                    <Input id="quantity" type="number" step="any" {...register('quantity')} className="col-span-3" />
                                    {errors.quantity && <p className="col-span-4 text-sm text-destructive">{errors.quantity.message}</p>}
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="purchasePrice" className="text-right">سعر الشراء</Label>
                                    <Input id="purchasePrice" type="number" step="any" {...register('purchasePrice')} className="col-span-3" />
                                    {errors.purchasePrice && <p className="col-span-4 text-sm text-destructive">{errors.purchasePrice.message}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">إضافة أصل</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">القيمة الحالية للمحفظة</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalCurrentValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</div>
                        <p className="text-xs text-muted-foreground">القيمة الإجمالية لجميع الأصول بالأسعار الحالية</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الربح/الخسارة</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {totalChange.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                        </div>
                         <p className={`text-xs ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% منذ الشراء
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد الأصول</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrichedAssets.length}</div>
                        <p className="text-xs text-muted-foreground">العدد الإجمالي للأصول المختلفة في المحفظة</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>مكونات المحفظة</CardTitle>
                </CardHeader>
                <CardContent>
                    {enrichedAssets.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الأصل</TableHead>
                                    <TableHead className="text-center">الكمية</TableHead>
                                    <TableHead className="text-center">متوسط سعر الشراء</TableHead>
                                    <TableHead className="text-center">القيمة الشرائية</TableHead>
                                    <TableHead className="text-center">القيمة الحالية</TableHead>
                                    <TableHead className="text-center">الربح/الخسارة</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrichedAssets.map((asset) => asset && (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <div className="font-medium">{asset.name}</div>
                                            <div className="text-sm text-muted-foreground">{asset.ticker}</div>
                                        </TableCell>
                                        <TableCell className="text-center">{asset.quantity.toLocaleString('ar-EG')}</TableCell>
                                        <TableCell className="text-center">{asset.purchasePrice.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency })}</TableCell>
                                        <TableCell className="text-center">{asset.purchaseValue.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency })}</TableCell>
                                        <TableCell className="text-center">{asset.currentValue.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency })}</TableCell>
                                        <TableCell className={`text-center font-medium ${asset.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                            <div>{asset.change.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency })}</div>
                                            <div className="text-xs">({asset.changePercent.toFixed(2)}%)</div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveAsset(asset.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="font-bold">الإجمالي</TableCell>
                                    <TableCell className="text-center font-bold">{totals.totalPurchaseValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</TableCell>
                                    <TableCell className="text-center font-bold">{totals.totalCurrentValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</TableCell>
                                    <TableCell colSpan={2} className={`text-center font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                        {totalChange.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })} ({totalChangePercent.toFixed(2)}%)
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <PackageOpen className="w-12 h-12"/>
                            <h3 className="text-xl font-semibold">المحفظة فارغة</h3>
                            <p>انقر على "إضافة أصل جديد" لبدء بناء محفظتك.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function PageSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}