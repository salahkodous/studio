
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { getPortfolio, onPortfolioAssetsUpdate, removeAssetFromPortfolio, addAssetToPortfolio, type PortfolioAsset, type PortfolioDetails } from '@/lib/firestore'
import { assets, type Asset, realEstateData } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, DollarSign, TrendingUp, AlertCircle, PackageOpen, Briefcase } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'

const addAssetSchema = z.object({
    name: z.string().min(2, "اسم الأصل مطلوب.").max(50, "الاسم طويل جدًا."),
    purchasePrice: z.coerce.number().min(0.01, "سعر الشراء يجب أن يكون أكبر من صفر."),
    quantity: z.coerce.number().min(0, "لا يمكن أن تكون الكمية سالبة.").optional(),
});


type AddAssetFormValues = z.infer<typeof addAssetSchema>

export default function PortfolioDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const params = useParams()
    const portfolioId = params.portfolioId as string

    const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(null)
    const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddAssetOpen, setAddAssetOpen] = useState(false)
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddAssetFormValues>({
        resolver: zodResolver(addAssetSchema),
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

    const handleAddAsset = async (data: AddAssetFormValues) => {
        if (!user) return;

        const assetPayload: Omit<PortfolioAsset, 'id'> = {
            name: data.name,
            purchasePrice: data.purchasePrice,
            quantity: data.quantity ?? null,
        };
        
        try {
            await addAssetToPortfolio(user.uid, portfolioId, assetPayload);
            toast({ title: "تمت إضافة الأصل", description: `تمت إضافة '${data.name}' إلى محفظتك بنجاح.` });
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
            let currentValue, currency;
            const purchaseValue = pa.purchasePrice;
            
            // Try to find a matching asset in our mock data by ticker or name
            const assetDetails = assets.find(a => 
                a.ticker.toLowerCase() === pa.name.toLowerCase() || 
                a.name.toLowerCase() === pa.name.toLowerCase()
            );

            if (assetDetails) { // If it's a known stock, bond, etc.
                currency = assetDetails.currency;
                if (assetDetails.category === 'Stocks' && pa.quantity) {
                    currentValue = pa.quantity * assetDetails.price;
                } else if (assetDetails.category === 'Savings Certificates') {
                    currentValue = pa.purchasePrice * (1 + (assetDetails.annualYield || 0));
                } else {
                    // For Gold, Bonds, etc., we'll simulate change based on its price movement
                    const originalPrice = assetDetails.price - parseFloat(assetDetails.change);
                    const changeRatio = originalPrice > 0 ? assetDetails.price / originalPrice : 1;
                    currentValue = pa.purchasePrice * changeRatio;
                }
            } else { // For unknown assets (like custom real estate), we can't get current value
                currentValue = pa.purchasePrice; // Assume no change for now
                currency = 'SAR'; // Default currency
            }

            const change = currentValue - purchaseValue;
            const changePercent = purchaseValue > 0 ? (change / purchaseValue) * 100 : 0;
            
            return {
                ...pa,
                currentValue,
                purchaseValue,
                currency,
                change,
                changePercent,
            }
        }).filter(Boolean);
    }, [portfolioAssets]);

    const totals = useMemo(() => {
        return enrichedAssets.reduce((acc, asset) => {
            if (asset) {
                // This is a simplified total and doesn't account for currency conversion
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
                                    أدخل اسم الأصل أو رمزه، وقيمته عند الشراء.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="name">اسم الأصل / الرمز</Label>
                                    <Input id="name" {...register('name')} placeholder="مثال: ARAMCO, عقار في جدة" />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                               </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">الكمية / المساحة (اختياري)</Label>
                                    <Input id="quantity" type="number" step="any" {...register('quantity')} placeholder="مثال: 100 (سهم), 250 (متر مربع)" />
                                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchasePrice">إجمالي قيمة الشراء</Label>
                                    <Input id="purchasePrice" type="number" step="any" {...register('purchasePrice')} placeholder="القيمة الإجمالية عند الشراء" />
                                    {errors.purchasePrice && <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>}
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
                        <div className="text-2xl font-bold">{totals.totalCurrentValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">مجموع تقديري. يتطلب تحويل عملات للوصول لقيمة دقيقة.</p>
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
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
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
                                    <TableHead className="text-center">التفاصيل</TableHead>
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
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {asset.quantity ? `الكمية: ${asset.quantity?.toLocaleString('ar-EG')}` : '-'}
                                        </TableCell>
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
                                    <TableCell colSpan={2} className="font-bold">الإجمالي (تقديري)</TableCell>
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
