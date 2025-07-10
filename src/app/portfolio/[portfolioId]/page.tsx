// This is a new file for displaying a single, detailed portfolio.
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { getPortfolio, onPortfolioAssetsUpdate, removeAssetFromPortfolio, addAssetToPortfolio, type PortfolioAsset, type PortfolioDetails } from '@/lib/firestore'
import { assets, type Asset, realEstateData, type RealEstateCity } from '@/lib/data'
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
import { PlusCircle, Trash2, DollarSign, TrendingUp, AlertCircle, PackageOpen, Building, PiggyBank, Briefcase } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'

const addAssetSchema = z.object({
    category: z.enum(["Stocks", "Real Estate", "Gold", "Savings Certificates"]),
    ticker: z.string().optional(),
    city: z.string().optional(),
    quantity: z.coerce.number().optional(), // For Stocks
    area: z.coerce.number().optional(), // For Real Estate
    purchasePrice: z.coerce.number().min(0.01, "سعر الشراء يجب أن يكون أكبر من صفر."),
}).superRefine((data, ctx) => {
    switch (data.category) {
        case "Stocks":
            if (!data.ticker) ctx.addIssue({ code: "custom", message: "الرجاء اختيار سهم.", path: ["ticker"] });
            if (!data.quantity || data.quantity <= 0) ctx.addIssue({ code: "custom", message: "الكمية يجب أن تكون أكبر من صفر.", path: ["quantity"] });
            break;
        case "Real Estate":
            if (!data.city) ctx.addIssue({ code: "custom", message: "الرجاء اختيار مدينة.", path: ["city"] });
            if (!data.area || data.area <= 0) ctx.addIssue({ code: "custom", message: "المساحة يجب أن تكون أكبر من صفر.", path: ["area"] });
            break;
        case "Gold":
            break; 
        case "Savings Certificates":
            break;
    }
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
    
    const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<AddAssetFormValues>({
        resolver: zodResolver(addAssetSchema),
        defaultValues: {
            category: "Stocks"
        }
    })

    const selectedCategory = watch("category");

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
    
    const availableAssetsGrouped = useMemo(() => {
        const stocks = assets.filter(a => a.category === 'Stocks');
        return stocks.reduce((acc, asset) => {
            if (!acc[asset.country]) {
                acc[asset.country] = [];
            }
            acc[asset.country].push(asset);
            return acc;
        }, {} as Record<string, Asset[]>);
    }, []);

    const handleAddAsset = async (data: AddAssetFormValues) => {
        if (!user) return;

        // For Savings Certificates, find the corresponding asset to use its ticker
        const ticker = data.category === 'Savings Certificates'
            ? assets.find(a => a.category === 'Savings Certificates')?.ticker || 'SAVINGS-CERT-SAR'
            : data.ticker;
        
        const assetPayload: Omit<PortfolioAsset, 'id'> = {
            category: data.category,
            purchasePrice: data.purchasePrice,
            ticker: ticker ?? null,
            city: data.city ?? null,
            area: data.area ?? null,
            quantity: data.quantity ?? null,
        };
        
        try {
            await addAssetToPortfolio(user.uid, portfolioId, assetPayload);
            toast({ title: "تمت إضافة الأصل", description: `تمت إضافة الأصل إلى محفظتك بنجاح.` });
            reset({ category: "Stocks" });
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
            let name, ticker, currentValue, currency;
            const purchaseValue = pa.purchasePrice;
            let assetDetails;

            switch (pa.category) {
                case 'Stocks':
                    assetDetails = assets.find(a => a.ticker === pa.ticker);
                    if (!assetDetails || !pa.quantity) return null;
                    name = assetDetails.name;
                    ticker = assetDetails.ticker;
                    currentValue = pa.quantity * assetDetails.price;
                    currency = assetDetails.currency;
                    break;
                case 'Real Estate':
                    const cityData = realEstateData.find(c => c.cityKey === pa.city);
                    if (!cityData || !pa.area) return null;
                    name = `عقار في ${cityData.name}`;
                    ticker = cityData.cityKey;
                    currentValue = pa.area * cityData.pricePerSqM;
                    currency = cityData.currency;
                    break;
                case 'Gold':
                    assetDetails = assets.find(a => a.category === 'Gold');
                    if (!assetDetails) return null;
                    name = "ذهب";
                    ticker = "GOLD";
                    // Simplified logic: value of gold doesn't depend on purchase price, but its current market price.
                    // This assumes purchasePrice represents the value of gold bought at a time.
                    // A more complex impl would store grams/ounces instead of just purchase price.
                    // For now, we simulate the change based on its movement since an arbitrary point.
                    currentValue = pa.purchasePrice * (assetDetails.price / (assetDetails.price - parseFloat(assetDetails.change)));
                    currency = assetDetails.currency;
                    break;
                case 'Savings Certificates':
                     assetDetails = assets.find(a => a.ticker === pa.ticker && a.category === 'Savings Certificates');
                     if (!assetDetails) return null;
                     name = assetDetails.name;
                     ticker = assetDetails.ticker;
                     // Use the annualYield from the data file, assuming a simple 1-year appreciation for this prototype
                     currentValue = pa.purchasePrice * (1 + (assetDetails.annualYield || 0));
                     currency = assetDetails.currency;
                     break;
                default:
                    return null;
            }

            const change = currentValue - purchaseValue;
            const changePercent = purchaseValue > 0 ? (change / purchaseValue) * 100 : 0;
            
            return {
                ...pa,
                name,
                ticker,
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
                // For a unified total, we'd need currency conversion.
                // For this prototype, we'll assume SAR as the base currency for simplicity.
                // This is NOT accurate for multi-currency portfolios.
                acc.totalPurchaseValue += asset.purchaseValue;
                acc.totalCurrentValue += asset.currentValue;
            }
            return acc;
        }, { totalPurchaseValue: 0, totalCurrentValue: 0 });
    }, [enrichedAssets]);
    
    const totalChange = totals.totalCurrentValue - totals.totalPurchaseValue;
    const totalChangePercent = totals.totalPurchaseValue > 0 ? (change / totals.totalPurchaseValue) * 100 : 0;


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
                                    اختر فئة الأصل وأدخل تفاصيله.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="category">فئة الأصل</Label>
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={(value) => {
                                                field.onChange(value);
                                                reset({ ...watch(), category: value, ticker: undefined, city: undefined, area: undefined, quantity: undefined });
                                            }} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر فئة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Stocks">أسهم</SelectItem>
                                                    <SelectItem value="Real Estate">عقارات</SelectItem>
                                                    <SelectItem value="Gold">ذهب</SelectItem>
                                                    <SelectItem value="Savings Certificates">شهادات ادخار</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                
                                {selectedCategory === "Stocks" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="ticker">السهم</Label>
                                             <Controller
                                                name="ticker"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger><SelectValue placeholder="ابحث عن سهم..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(availableAssetsGrouped).map(([country, assetsInCategory]) => (
                                                                <SelectGroup key={country}>
                                                                    <SelectLabel>{country === 'SA' ? 'السعودية' : country === 'AE' ? 'الإمارات' : 'قطر'}</SelectLabel>
                                                                    {assetsInCategory.map(asset => (
                                                                        <SelectItem key={asset.ticker} value={asset.ticker}>{asset.name}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.ticker && <p className="text-sm text-destructive">{errors.ticker.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">الكمية (عدد الأسهم)</Label>
                                            <Input id="quantity" type="number" step="any" {...register('quantity')} />
                                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                                        </div>
                                    </>
                                )}

                                {selectedCategory === "Real Estate" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">المدينة</Label>
                                            <Controller
                                                name="city"
                                                control={control}
                                                render={({ field }) => (
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger><SelectValue placeholder="اختر مدينة" /></SelectTrigger>
                                                        <SelectContent>
                                                            {realEstateData.map(city => (
                                                                <SelectItem key={city.cityKey} value={city.cityKey}>{city.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="area">المساحة (متر مربع)</Label>
                                            <Input id="area" type="number" step="any" {...register('area')} />
                                            {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="purchasePrice">
                                        {selectedCategory === 'Gold' ? 'قيمة الشراء الإجمالية' : selectedCategory === 'Real Estate' ? 'إجمالي سعر الشراء' : selectedCategory === 'Savings Certificates' ? 'قيمة الشهادة عند الشراء' : 'إجمالي قيمة الشراء'}
                                    </Label>
                                    <Input id="purchasePrice" type="number" step="any" {...register('purchasePrice')} />
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
                                            <div className="text-sm text-muted-foreground">{asset.ticker}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {asset.category === 'Stocks' && `الكمية: ${asset.quantity?.toLocaleString('ar-EG')}`}
                                            {asset.category === 'Real Estate' && `المساحة: ${asset.area?.toLocaleString('ar-EG')} م²`}
                                            {asset.category === 'Gold' && '-'}
                                            {asset.category === 'Savings Certificates' && '-'}
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
