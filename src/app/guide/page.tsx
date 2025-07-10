'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { streamInvestmentStrategy } from '@/ai/flows/stream-investment-strategy'
import type { InvestmentStrategyOutput } from '@/ai/schemas/investment-strategy-schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Wand2, Lightbulb, PieChart as PieChartIcon, AlertTriangle, Save, CheckCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { ChartConfig } from '@/components/ui/chart'
import { useAuth } from '@/hooks/use-auth'
import { saveStrategy } from '@/lib/firestore'
import { Skeleton } from '@/components/ui/skeleton'

const StrategyPieChart = dynamic(
  () => import('@/components/strategy-pie-chart').then((mod) => mod.StrategyPieChart),
  {
    loading: () => <Skeleton className="mx-auto aspect-square h-[250px] rounded-full" />,
    ssr: false
  }
);


const formSchema = z.object({
  capital: z.coerce.number().min(1000, 'الحد الأدنى لرأس المال هو 1000 دولار'),
  categories: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'يجب أن تختار فئة استثمار واحدة على الأقل.',
  }),
  otherCategory: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high'], {
    required_error: 'الرجاء اختيار مستوى المخاطرة.',
  }),
  investmentGoals: z.string().min(10, 'الرجاء وصف أهدافك الاستثمارية بمزيد من التفصيل.'),
}).superRefine((data, ctx) => {
    if (data.categories.includes('Other') && (!data.otherCategory || data.otherCategory.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'الرجاء تحديد نوع الاستثمار الآخر.',
            path: ['otherCategory'],
        });
    }
});


type FormValues = z.infer<typeof formSchema>

const investmentCategories = [
  { id: 'Stocks', label: 'الأسهم' },
  { id: 'Gold', label: 'الذهب' },
  { id: 'Real Estate', label: 'العقارات' },
  { id: 'Bonds', label: 'السندات' },
  { id: 'Other', label: 'أخرى' },
]

export default function GuidePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<Partial<InvestmentStrategyOutput>>({});
  const finalResultRef = useRef<InvestmentStrategyOutput | null>(null);
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capital: 10000,
      categories: ['Stocks'],
      riskLevel: 'medium',
      investmentGoals: 'تحقيق نمو في رأس المال على المدى الطويل مع تنويع الاستثمارات.',
      otherCategory: '',
    },
  })
  
  const watchedCategories = watch('categories', []);
  const showOtherField = watchedCategories.includes('Other');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setResult({});
    finalResultRef.current = null;
    setIsGenerating(true);
    setIsSaving(false);
    
    try {
      // Pass the validated data directly
      const {stream, response} = await streamInvestmentStrategy(data);
      for await (const chunk of stream) {
        setResult(chunk);
      }
      const finalResult = await response;
      finalResultRef.current = finalResult;

      if (user && finalResult) {
        setIsSaving(true);
        try {
            await saveStrategy(user.uid, finalResult);
            toast({
              title: 'تم حفظ الخطة بنجاح',
              description: 'يمكنك عرض خططك المحفوظة في صفحة "خططي الاستثمارية".',
              action: (
                  <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-success" />
                      <span>حُفظت</span>
                  </div>
              )
            })
        } catch (saveError) {
            console.error('Error saving strategy:', saveError)
            toast({
                title: 'خطأ في الحفظ',
                description: 'تم إنشاء الخطة ولكن لم نتمكن من حفظها تلقائيًا.',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Error generating strategy:', error)
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من إنشاء خطة الاستثمار. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false);
    }
  }

  const chartData = useMemo(() => result?.assetAllocation ?? [], [result]);
  const chartConfig = useMemo(() => (chartData.reduce((acc, curr, index) => {
    const key = curr.category.replace(/[^a-zA-Z0-9]/g, "");
    acc[key] = {
      label: curr.category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig)), [chartData]);
  
  const hasResult = Object.keys(result).length > 0;

  if (!isClient) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline">دليل الاستثمار الذكي</h1>
          <p className="text-lg text-muted-foreground mt-2">
            أدخل تفاصيل استثمارك واحصل على استراتيجية مخصصة مدعومة بالذكاء الاصطناعي.
          </p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-3"><Skeleton className="h-5 w-48" /><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div></div>
            <div className="space-y-3"><Skeleton className="h-5 w-40" /><div className="flex flex-col md:flex-row gap-4"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" /></div></div>
            <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">دليل الاستثمار الذكي</h1>
        <p className="text-lg text-muted-foreground mt-2">
          أدخل تفاصيل استثمارك واحصل على استراتيجية مخصصة مدعومة بالذكاء الاصطناعي.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إنشاء خطة استثمار</CardTitle>
          <CardDescription>املأ النموذج أدناه للحصول على استراتيجيتك. إذا كنت مسجلاً دخولك، سيتم حفظ الخطة تلقائياً.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Capital */}
            <div className="space-y-2">
              <Label htmlFor="capital">رأس المال (بالدولار الأمريكي)</Label>
              <Input id="capital" type="number" {...register('capital')} placeholder="e.g., 50000" />
              {errors.capital && <p className="text-sm text-destructive">{errors.capital.message}</p>}
            </div>

            {/* Investment Categories */}
            <div className="space-y-3">
              <Label>فئات الاستثمار (اختر واحدة على الأقل)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {investmentCategories.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={item.id}
                      checked={watchedCategories.includes(item.id)}
                      onCheckedChange={(checked) => {
                        const currentCategories = watchedCategories;
                        const newCategories = checked
                          ? [...currentCategories, item.id]
                          : currentCategories.filter((value) => value !== item.id);
                        setValue('categories', newCategories, { shouldValidate: true });
                        // Proactively clear the 'other' field if it's unchecked
                        if (!newCategories.includes('Other')) {
                            setValue('otherCategory', '', { shouldValidate: true });
                        }
                      }}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
              {errors.categories && <p className="text-sm text-destructive">{errors.categories.message}</p>}
              {showOtherField && (
                  <div className="space-y-2 pt-2">
                      <Label htmlFor="otherCategory">الرجاء تحديد نوع الاستثمار الآخر</Label>
                      <Input id="otherCategory" {...register('otherCategory')} placeholder="مثال: فن، مقتنيات، أسهم خاصة..." />
                      {errors.otherCategory && <p className="text-sm text-destructive">{errors.otherCategory.message}</p>}
                  </div>
              )}
            </div>

            {/* Risk Level */}
            <div className="space-y-3">
              <Label>مستوى تحمل المخاطر</Label>
              <RadioGroup
                onValueChange={(value: 'low' | 'medium' | 'high') => setValue('riskLevel', value, { shouldValidate: true })}
                defaultValue="medium"
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal">منخفض</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">متوسط</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">مرتفع</Label>
                </div>
              </RadioGroup>
              {errors.riskLevel && <p className="text-sm text-destructive">{errors.riskLevel.message}</p>}
            </div>

            {/* Investment Goals */}
            <div className="space-y-2">
              <Label htmlFor="investmentGoals">الأهداف الاستثمارية</Label>
              <Input id="investmentGoals" {...register('investmentGoals')} placeholder="مثال: تحقيق دخل شهري، تنمية رأس المال للتقاعد..." />
              {errors.investmentGoals && <p className="text-sm text-destructive">{errors.investmentGoals.message}</p>}
            </div>

            <Button type="submit" disabled={isGenerating || isSaving} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الخطة...
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري حفظ الخطة...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  أنشئ استراتيجيتي
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isGenerating && !hasResult && (
        <div className="text-center p-8 space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">يقوم خبراؤنا الافتراضيون بتحليل طلبك...</p>
        </div>
      )}

      {hasResult && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-primary" />
              {result.strategyTitle || <Skeleton className="h-8 w-3/4" />}
            </CardTitle>
             <CardDescription>{result.strategySummary || <Skeleton className="h-4 w-full mt-2" />}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                توزيع الأصول المقترح
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="grid gap-3 text-sm">
                    {result.assetAllocation ? result.assetAllocation.map((asset, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{
                            backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between font-medium">
                            <span>{asset.category}</span>
                            <span>{asset.percentage}%</span>
                          </div>
                          <p className="text-muted-foreground">{asset.rationale}</p>
                        </div>
                      </div>
                    )) : (
                       <div className="space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                       </div>
                    )}
                  </div>
                </div>
                <div className="order-1 md:order-2 h-[250px] flex items-center justify-center">
                   <StrategyPieChart chartData={chartData} chartConfig={chartConfig} />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">توصيات الخبراء</h3>
               <div className="space-y-4">
                {result.recommendations ? result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-bold">{rec.name} <span className="text-xs text-muted-foreground">{rec.ticker}</span></p>
                      <p className="text-sm text-muted-foreground">{rec.justification}</p>
                    </div>
                  </div>
                )) : (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}
              </div>
            </div>
            <Separator />
             <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                تحليل المخاطر
              </h3>
              <p className="text-sm text-muted-foreground">{result.riskAnalysis || <Skeleton className="h-16 w-full" />}</p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
