
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, DollarSign, TrendingUp, AlertCircle, PackageOpen, Briefcase, ChevronLeft, Loader2 } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { findMarketAssetsTool, getStockPrice } from '@/ai/tools/market-tools'


const addAssetSchema = z.object({
    name: z.string().min(2, "اسم الأصل مطلوب.").max(50, "الاسم طويل جدًا."),
    purchasePrice: z.coerce.number().min(0.01, "يجب أن يكون سعر الشراء أكبر من صفر."),
    quantity: z.coerce.number().min(0.01, "يجب أن تكون الكمية أكبر من صفر."),
});

type AddAssetFormValues = z.infer<typeof addAssetSchema>

const assetCategories = [
    { id: 'Stocks', label: 'أسهم' },
    { id: 'Real Estate', label: 'عقارات' },
    { id: 'Gold', label: 'ذهب' },
    { id: 'Bonds', label: 'سندات' },
    { id: 'Other', label: 'أخرى (يدوي)' },
];

const stockCountries = [
    { id: 'SA', label: 'السعودية' },
    { id: 'AE', label: 'الإمارات' },
    { id: 'QA', label: 'قطر' },
];

type AvailableAsset = Asset | RealEstateCity | { name: string; ticker: string; name_ar: string };

type LivePrice = { price: number; currency: string } | { error: string };

export default function PortfolioDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const params = useParams()
    const portfolioId = params.portfolioId as string

    const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(null)
    const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
    const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
    const [loading, setLoading] = useState(true)
    const [isAddAssetOpen, setAddAssetOpen] = useState(false)
    
    // State for the new multi-step Add Asset form
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<AvailableAsset | null>(null);
    const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
    const [isFetchingAssets, setIsFetchingAssets] = useState(false);


    const { register, handleSubmit, formState: { errors }, reset, setValue: setFormValue } = useForm<AddAssetFormValues>({
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
                try {
                    const details = await getPortfolio(user.uid, portfolioId);
                    if (details) {
                        setPortfolioDetails(details);
                    } else {
                        toast({ title: "المحفظة غير موجودة", description: "تعذر العثور على هذه المحفظة.", variant: 'destructive' })
                        router.push('/portfolios');
                    }
                } catch (e) {
                     toast({ title: "خطأ", description: "تعذر تحميل تفاصيل المحفظة.", variant: 'destructive' })
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

    const fetchAllLivePrices = useCallback(async () => {
        if (portfolioAssets.length === 0) return;
    
        const stockAssets = portfolioAssets.filter(asset => asset.ticker && asset.category === 'Stocks');
        if (stockAssets.length === 0) return;
        
        console.log(`Fetching live prices for ${stockAssets.length} stock(s)`);
        
        let hasFailed = false;
        const pricePromises = stockAssets.map(asset => 
            getStockPrice({ ticker: asset.ticker!, companyName: asset.name_ar })
                .catch(error => {
                    console.error(`[Portfolio Page] Failed to fetch price for ${asset.ticker}:`, error.message);
                    hasFailed = true;
                    return { error: error.message }; // Return an error object for this specific ticker
                })
        );
    
        const results = await Promise.all(pricePromises);
        
        const newLivePrices: Record<string, LivePrice> = {};
        results.forEach((result, index) => {
            const stockAsset = stockAssets[index];
            if (stockAsset.ticker) {
                newLivePrices[stockAsset.ticker] = result;
            }
        });
        setLivePrices(newLivePrices);
        
        if (hasFailed) {
            toast({
                title: "فشل في جلب بعض الأسعار الحية",
                description: "قد تكون واجهة برمجة تطبيقات Twelve Data معطلة أو أن مفتاح API غير صالح.",
                variant: "destructive"
            });
        }
    }, [portfolioAssets, toast]);
    
    useEffect(() => {
        if (portfolioAssets.length > 0) {
            fetchAllLivePrices();
        }
    }, [portfolioAssets, fetchAllLivePrices]);


    const resetAddAssetFlow = () => {
        setStep(1);
        setSelectedCategory(null);
        setSelectedCountry(null);
        setSelectedAsset(null);
        setAvailableAssets([]);
        reset();
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetAddAssetFlow();
        }
        setAddAssetOpen(open);
    }
    
    const fetchAssetsForCategory = async (category: string, country?: string | null) => {
        setIsFetchingAssets(true);
        try {
            if (category === 'Stocks' && country) {
                const foundAssets = await findMarketAssetsTool({ market: country as 'SA' | 'AE' | 'QA' });
                setAvailableAssets(foundAssets);
            } else if (category === 'Real Estate') {
                setAvailableAssets(realEstateData);
            } else {
                const filteredAssets = assets.filter(a => a.category === category);
                setAvailableAssets(filteredAssets);
            }
        } catch (error) {
            console.error("Error fetching assets:", error);
            toast({ title: "خطأ", description: "فشل في جلب قائمة الأصول. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
            setAvailableAssets([]);
        } finally {
            setIsFetchingAssets(false);
        }
    };


    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        if (categoryId === 'Stocks') {
            setStep(2);
        } else if (['Real Estate', 'Gold', 'Bonds'].includes(categoryId)) {
            fetchAssetsForCategory(categoryId);
            setStep(3);
        } else { // 'Other'
            setStep(4);
        }
    }
    
    const handleCountrySelect = (countryId: string) => {
        setSelectedCountry(countryId);
        if (selectedCategory) {
            fetchAssetsForCategory(selectedCategory, countryId);
        }
        setStep(3);
    }

    const handleAssetSelect = (assetIdentifier: string) => {
        const foundAsset = availableAssets.find(a => ('ticker' in a ? a.ticker : a.cityKey) === assetIdentifier);
        if (foundAsset) {
            setSelectedAsset(foundAsset);
            setFormValue('name', 'name_ar' in foundAsset ? foundAsset.name_ar : foundAsset.name);
            setStep(4);
        }
    }

    const handleAddAsset = async (data: AddAssetFormValues) => {
        if (!user) return;

        const assetTicker = selectedAsset && 'ticker' in selectedAsset 
            ? selectedAsset.ticker 
            : selectedAsset && 'cityKey' in selectedAsset 
            ? selectedAsset.cityKey
            : null;

        const assetPayload: Omit<PortfolioAsset, 'id'> = {
            name: selectedAsset ? selectedAsset.name : data.name,
            name_ar: selectedAsset ? ('name_ar' in selectedAsset ? selectedAsset.name_ar : selectedAsset.name) : data.name,
            ticker: assetTicker,
            category: selectedCategory!,
            purchasePrice: data.purchasePrice,
            quantity: data.quantity ?? null,
        };
        
        try {
            await addAssetToPortfolio(user.uid, portfolioId, assetPayload);
            toast({ title: "تمت إضافة الأصل", description: `تمت إضافة '${assetPayload.name_ar}' إلى محفظتك بنجاح.` });
            handleOpenChange(false);
        } catch (error) {
            console.error("Error adding asset:", error);
            toast({ title: "خطأ", description: "فشل في إضافة الأصل. الرجاء المحاولة مرة أخرى.", variant: 'destructive' });
        }
    }
    
    const handleRemoveAsset = async (assetId: string) => {
         if (!user) return;
        try {
            await removeAssetFromPortfolio(user.uid, portfolioId, assetId);
            toast({ title: "تم حذف الأصل", description: "تم حذف الأصل من المحفظة.", variant: 'destructive' });
        } catch (error) {
            console.error("Error removing asset:", error);
            toast({ title: "خطأ", description: "فشل في حذف الأصل.", variant: 'destructive' });
        }
    }
    
    const enrichedAssets = useMemo(() => {
        return portfolioAssets.map(pa => {
            const purchaseValue = pa.purchasePrice * (pa.quantity || 1);
            const livePriceData = pa.ticker ? livePrices[pa.ticker] : undefined;
            const staticAssetDetails = assets.find(a => a.ticker === pa.ticker);
            const currency = staticAssetDetails?.currency || 'USD';

            let currentValue: number | null = null;
            if (livePriceData && 'price' in livePriceData && pa.quantity) {
                currentValue = pa.quantity * livePriceData.price;
            } else {
                currentValue = null; // Set to null if live price failed or not available
            }
            
            const change = currentValue !== null ? currentValue - purchaseValue : null;
            const changePercent = (currentValue !== null && purchaseValue > 0) ? (change! / purchaseValue) * 100 : null;
            
            return { ...pa, currentValue, purchaseValue, currency, change, changePercent };
        });
    }, [portfolioAssets, livePrices]);

    const totals = useMemo(() => {
        return enrichedAssets.reduce((acc, asset) => {
            acc.totalPurchaseValue += asset.purchaseValue;
            if (asset.currentValue !== null) {
                acc.totalCurrentValue += asset.currentValue;
                acc.hasLiveData = true;
            }
            return acc;
        }, { totalPurchaseValue: 0, totalCurrentValue: 0, hasLiveData: false });
    }, [enrichedAssets]);
    
    const totalChange = totals.hasLiveData ? totals.totalCurrentValue - totals.totalPurchaseValue : null;
    const totalChangePercent = (totalChange !== null && totals.totalPurchaseValue > 0) ? (totalChange / totals.totalPurchaseValue) * 100 : null;

    if (loading) return <PageSkeleton />;

    if (!portfolioDetails) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <Card className="text-center py-20">
                     <CardHeader>
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive"/>
                        <CardTitle>المحفظة غير موجودة</CardTitle>
                        <CardDescription>ربما تم حذفها أو أن الرابط غير صحيح.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/portfolios">العودة إلى قائمة المحافظ</Link>
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
                    <p className="text-muted-foreground">تاريخ الإنشاء: {new Date(portfolioDetails.createdAt).toLocaleDateString()}</p>
                </div>
                 <Dialog open={isAddAssetOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="ml-2" />
                            إضافة أصل جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>إضافة أصل جديد</DialogTitle>
                            <DialogDescription>
                                اتبع الخطوات لإضافة أصل جديد إلى محفظتك.
                            </DialogDescription>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="space-y-4 py-4">
                                <Label>الخطوة 1: اختر نوع الأصل</Label>
                                <RadioGroup onValueChange={handleCategorySelect} className="grid grid-cols-2 gap-4">
                                    {assetCategories.map(cat => (
                                        <Label key={cat.id} htmlFor={cat.id} className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                                            <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                                            {cat.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {step === 2 && selectedCategory === 'Stocks' && (
                            <div className="space-y-4 py-4">
                                <Label>الخطوة 2: اختر السوق</Label>
                                <RadioGroup onValueChange={handleCountrySelect} className="grid grid-cols-3 gap-4">
                                    {stockCountries.map(country => (
                                         <Label key={country.id} htmlFor={country.id} className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                                            <RadioGroupItem value={country.id} id={country.id} className="sr-only" />
                                            {country.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <Button variant="link" onClick={() => setStep(1)}>رجوع</Button>
                            </div>
                        )}
                        
                        {step === 3 && (
                            <div className="space-y-4 py-4">
                                <Label>الخطوة 3: اختر الأصل</Label>
                                {isFetchingAssets ? (
                                    <div className="flex items-center justify-center h-24">
                                        <Loader2 className="animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <Select onValueChange={handleAssetSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر أصلاً..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAssets.map(asset => (
                                                <SelectItem key={'ticker' in asset ? asset.ticker : ('cityKey' in asset ? asset.cityKey : asset.name)} value={'ticker' in asset ? asset.ticker : ('cityKey' in asset ? asset.cityKey : asset.name)}>
                                                    {'name_ar' in asset ? asset.name_ar : asset.name}{'ticker' in asset && ` (${asset.ticker})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                 <Button variant="link" onClick={() => setStep(selectedCategory === 'Stocks' ? 2 : 1)}>رجوع</Button>
                            </div>
                        )}

                        {step === 4 && (
                            <form onSubmit={handleSubmit(handleAddAsset)}>
                                <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                        <Label htmlFor="name">اسم الأصل</Label>
                                        <Input id="name" {...register('name')} placeholder="مثال: شقة في جدة" disabled={selectedCategory !== 'Other'}/>
                                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">الكمية (أسهم) / المساحة (متر مربع)</Label>
                                    <Input id="quantity" type="number" step="any" {...register('quantity')} placeholder="مثال: 100" />
                                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchasePrice">سعر الشراء للوحدة الواحدة</Label>
                                    <Input id="purchasePrice" type="number" step="any" {...register('purchasePrice')} placeholder="سعر السهم/المتر وقت الشراء" />
                                    {errors.purchasePrice && <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>}
                                </div>

                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" type="button" onClick={() => setStep(selectedCategory === 'Other' ? 1 : 3)}>رجوع</Button>
                                    <Button type="submit">إضافة أصل</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">القيمة الحالية للمحفظة</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totals.hasLiveData 
                                ? totals.totalCurrentValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })
                                : 'جاري الحساب...'}
                        </div>
                        <p className="text-xs text-muted-foreground">إجمالي تقديري. قد يتم تطبيق تحويل العملات.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الربح/الخسارة</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {totalChange !== null ? (
                            <>
                                <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {totalChange.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                                </div>
                                <p className={`text-xs ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {totalChange >= 0 ? '+' : ''}{totalChangePercent!.toFixed(2)}% منذ الشراء
                                </p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold">N/A</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد الأصول</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrichedAssets.length}</div>
                        <p className="text-xs text-muted-foreground">إجمالي الأصول الفريدة في المحفظة</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>ممتلكات المحفظة</CardTitle>
                </CardHeader>
                <CardContent>
                    {enrichedAssets.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الأصل</TableHead>
                                    <TableHead className="text-center">الكمية</TableHead>
                                    <TableHead className="text-center">قيمة الشراء</TableHead>
                                    <TableHead className="text-center">القيمة الحالية</TableHead>
                                    <TableHead className="text-center">الربح/الخسارة</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrichedAssets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <div className="font-medium">{asset.name_ar}</div>
                                            {asset.ticker && <div className="text-xs text-muted-foreground">{asset.ticker}</div>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {asset.quantity ? `${asset.quantity?.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">{asset.purchaseValue.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency, minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-center">
                                            {asset.currentValue !== null ? asset.currentValue.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency, minimumFractionDigits: 2 }) : <span className="text-muted-foreground">N/A</span>}
                                        </TableCell>
                                        <TableCell className={`text-center font-medium`}>
                                            {asset.change !== null ? (
                                                <div className={asset.change >= 0 ? 'text-success' : 'text-destructive'}>
                                                    <div>{asset.change.toLocaleString('ar-SA', { style: 'currency', currency: asset.currency, minimumFractionDigits: 2 })}</div>
                                                    <div className="text-xs">({asset.changePercent!.toFixed(2)}%)</div>
                                                </div>
                                            ) : (
                                                 <span className="text-muted-foreground">N/A</span>
                                            )}
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
                                    <TableCell className="text-center font-bold">
                                        {totals.hasLiveData ? totals.totalCurrentValue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' }) : 'N/A'}
                                    </TableCell>
                                    <TableCell colSpan={2} className={`text-center font-bold`}>
                                        {totalChange !== null ? (
                                            <span className={totalChange >= 0 ? 'text-success' : 'text-destructive'}>
                                                {totalChange.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })} ({totalChangePercent!.toFixed(2)}%)
                                            </span>
                                        ) : 'N/A'}
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
