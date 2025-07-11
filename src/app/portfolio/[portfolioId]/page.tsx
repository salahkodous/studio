
'use client'

import { useState, useEffect, useMemo } from 'react'
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
    name: z.string().min(2, "Asset name is required.").max(50, "Name is too long."),
    purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than zero."),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative.").optional(),
});

type AddAssetFormValues = z.infer<typeof addAssetSchema>

const assetCategories = [
    { id: 'Stocks', label: 'Stocks' },
    { id: 'Real Estate', label: 'Real Estate' },
    { id: 'Gold', label: 'Gold' },
    { id: 'Bonds', label: 'Bonds' },
    { id: 'Other', label: 'Other (Manual)' },
];

const stockCountries = [
    { id: 'SA', label: 'Saudi Arabia' },
    { id: 'AE', label: 'UAE' },
    { id: 'QA', label: 'Qatar' },
];

type AvailableAsset = Asset | RealEstateCity | { name: string; ticker: string };


export default function PortfolioDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const params = useParams()
    const portfolioId = params.portfolioId as string

    const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(null)
    const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([])
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
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
                        toast({ title: "Portfolio not found", description: "Could not find this portfolio.", variant: 'destructive' })
                        router.push('/portfolios');
                    }
                } catch (e) {
                     toast({ title: "Error", description: "Could not load portfolio details.", variant: 'destructive' })
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

    useEffect(() => {
        const fetchAllLivePrices = async () => {
            const pricePromises = portfolioAssets
                .filter(asset => asset.ticker && asset.category === 'Stocks')
                .map(asset => getStockPrice({ ticker: asset.ticker!, companyName: asset.name }));

            const results = await Promise.allSettled(pricePromises);
            
            const newLivePrices: Record<string, number> = {};
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const ticker = portfolioAssets[index].ticker!;
                    newLivePrices[ticker] = result.value.price;
                }
            });
            setLivePrices(newLivePrices);
        };

        if (portfolioAssets.length > 0) {
            fetchAllLivePrices();
        }
    }, [portfolioAssets]);

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
            toast({ title: "Error", description: "Failed to fetch asset list. Please try again.", variant: 'destructive' });
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
            setFormValue('name', foundAsset.name);
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
            ticker: assetTicker,
            category: selectedCategory!,
            purchasePrice: data.purchasePrice,
            quantity: data.quantity ?? null,
        };
        
        try {
            await addAssetToPortfolio(user.uid, portfolioId, assetPayload);
            toast({ title: "Asset Added", description: `'${assetPayload.name}' was successfully added to your portfolio.` });
            handleOpenChange(false);
        } catch (error) {
            console.error("Error adding asset:", error);
            toast({ title: "Error", description: "Failed to add asset. Please try again.", variant: 'destructive' });
        }
    }
    
    const handleRemoveAsset = async (assetId: string) => {
         if (!user) return;
        try {
            await removeAssetFromPortfolio(user.uid, portfolioId, assetId);
            toast({ title: "Asset Removed", description: "The asset has been removed from the portfolio.", variant: 'destructive' });
        } catch (error) {
            console.error("Error removing asset:", error);
            toast({ title: "Error", description: "Failed to remove the asset.", variant: 'destructive' });
        }
    }
    
    const enrichedAssets = useMemo(() => {
        return portfolioAssets.map(pa => {
            const purchaseValue = pa.purchasePrice;
            
            const assetDetails = pa.ticker ? assets.find(a => a.ticker === pa.ticker) : null;
            const livePrice = pa.ticker ? livePrices[pa.ticker] : undefined;

            let currentValue: number;
            
            if (livePrice !== undefined && pa.quantity != null && pa.quantity > 0) {
                 // Priority: Live price with quantity
                currentValue = pa.quantity * livePrice;
            } else if (livePrice !== undefined) {
                // Live price without quantity (estimate change)
                const staticPrice = assetDetails?.price || purchaseValue;
                if (staticPrice > 0) {
                    const changeRatio = livePrice / staticPrice;
                    currentValue = purchaseValue * changeRatio;
                } else {
                    currentValue = purchaseValue;
                }
            } else if (assetDetails) {
                 // Fallback to static price if live price isn't available
                 if (pa.quantity != null && pa.quantity > 0) {
                    currentValue = pa.quantity * assetDetails.price;
                 } else {
                    currentValue = purchaseValue; // Cannot estimate without live price or quantity
                 }
            } else {
                // Manual or non-stock asset
                currentValue = purchaseValue; // Can't calculate current value, so it remains the same as purchase
            }
            
            const change = currentValue - purchaseValue;
            const changePercent = purchaseValue > 0 ? (change / purchaseValue) * 100 : 0;
            const currency = assetDetails?.currency || 'USD';
            
            return { ...pa, currentValue, purchaseValue, currency, change, changePercent };
        }).filter(Boolean);
    }, [portfolioAssets, livePrices]);

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

    if (loading) return <PageSkeleton />;

    if (!portfolioDetails) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <Card className="text-center py-20">
                     <CardHeader>
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive"/>
                        <CardTitle>Portfolio Not Found</CardTitle>
                        <CardDescription>It may have been deleted or the link is incorrect.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/portfolios">Back to Portfolios</Link>
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
                    <p className="text-muted-foreground">Created on: {new Date(portfolioDetails.createdAt).toLocaleDateString()}</p>
                </div>
                 <Dialog open={isAddAssetOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            Add New Asset
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Asset</DialogTitle>
                            <DialogDescription>
                                Follow the steps to add a new asset to your portfolio.
                            </DialogDescription>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="space-y-4 py-4">
                                <Label>Step 1: Choose Asset Type</Label>
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
                                <Label>Step 2: Choose Market</Label>
                                <RadioGroup onValueChange={handleCountrySelect} className="grid grid-cols-3 gap-4">
                                    {stockCountries.map(country => (
                                         <Label key={country.id} htmlFor={country.id} className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                                            <RadioGroupItem value={country.id} id={country.id} className="sr-only" />
                                            {country.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <Button variant="link" onClick={() => setStep(1)}>Back</Button>
                            </div>
                        )}
                        
                        {step === 3 && (
                            <div className="space-y-4 py-4">
                                <Label>Step 3: Choose Asset</Label>
                                {isFetchingAssets ? (
                                    <div className="flex items-center justify-center h-24">
                                        <Loader2 className="animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <Select onValueChange={handleAssetSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an asset..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAssets.map(asset => (
                                                <SelectItem key={'ticker' in asset ? asset.ticker : asset.cityKey} value={'ticker' in asset ? asset.ticker : asset.cityKey}>
                                                    {asset.name}{'ticker' in asset && ` (${asset.ticker})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                 <Button variant="link" onClick={() => setStep(selectedCategory === 'Stocks' ? 2 : 1)}>Back</Button>
                            </div>
                        )}

                        {step === 4 && (
                            <form onSubmit={handleSubmit(handleAddAsset)}>
                                <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                        <Label htmlFor="name">Asset Name</Label>
                                        <Input id="name" {...register('name')} placeholder="e.g., Jeddah Apartment" disabled={selectedCategory !== 'Other'}/>
                                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity / Area (optional)</Label>
                                    <Input id="quantity" type="number" step="any" {...register('quantity')} placeholder="e.g., 100 (shares), 250 (sqm)" />
                                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchasePrice">Total Purchase Value</Label>
                                    <Input id="purchasePrice" type="number" step="any" {...register('purchasePrice')} placeholder="Total value at time of purchase" />
                                    {errors.purchasePrice && <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>}
                                </div>

                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" type="button" onClick={() => setStep(selectedCategory === 'Other' ? 1 : 3)}>Back</Button>
                                    <Button type="submit">Add Asset</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Current Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalCurrentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">Estimated total. Currency conversion may apply.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {totalChange.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                         <p className={`text-xs ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% since purchase
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Number of Assets</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrichedAssets.length}</div>
                        <p className="text-xs text-muted-foreground">Total unique assets in portfolio</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                    {enrichedAssets.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead className="text-center">Details</TableHead>
                                    <TableHead className="text-center">Purchase Value</TableHead>
                                    <TableHead className="text-center">Current Value</TableHead>
                                    <TableHead className="text-center">Gain/Loss</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrichedAssets.map((asset) => asset && (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <div className="font-medium">{asset.name}</div>
                                            {asset.ticker && <div className="text-xs text-muted-foreground">{asset.ticker}</div>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {asset.quantity ? `Qty: ${asset.quantity?.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">{asset.purchaseValue.toLocaleString('en-US', { style: 'currency', currency: asset.currency })}</TableCell>
                                        <TableCell className="text-center">{asset.currentValue.toLocaleString('en-US', { style: 'currency', currency: asset.currency })}</TableCell>
                                        <TableCell className={`text-center font-medium ${asset.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                            <div>{asset.change.toLocaleString('en-US', { style: 'currency', currency: asset.currency })}</div>
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
                                    <TableCell colSpan={2} className="font-bold">Total (Estimated)</TableCell>
                                    <TableCell className="text-center font-bold">{totals.totalPurchaseValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                    <TableCell className="text-center font-bold">{totals.totalCurrentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                    <TableCell colSpan={2} className={`text-center font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                        {totalChange.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ({totalChangePercent.toFixed(2)}%)
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <PackageOpen className="w-12 h-12"/>
                            <h3 className="text-xl font-semibold">Portfolio is empty</h3>
                            <p>Click "Add New Asset" to start building your portfolio.</p>
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

    

    
