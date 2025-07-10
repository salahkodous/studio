// This is a new file for the Market Analyst AI Agent
'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, TrendingUp, Newspaper, Shield, BadgeCheck, AlertTriangle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { assets, type Asset } from '@/lib/data';
import { analyzeMarketForTicker } from '@/ai/flows/market-analyst-flow';
import type { MarketAnalysis } from '@/ai/schemas/market-analysis-schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  ticker: z.string().min(1, 'الرجاء اختيار سهم لتحليله.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnalysisPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MarketAnalysis | null>(null);
  const { toast } = useToast();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setResult(null);
    setIsGenerating(true);

    try {
      const finalResult = await analyzeMarketForTicker({ ticker: data.ticker });
      setResult(finalResult);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من إنشاء التحليل. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const recommendationStyle = useMemo(() => {
    if (!result) return { Icon: Info, color: 'text-muted-foreground', label: 'غير محدد' };
    switch (result.recommendation.decision) {
      case 'Buy':
        return { Icon: BadgeCheck, color: 'text-success', label: 'شراء' };
      case 'Sell':
        return { Icon: AlertTriangle, color: 'text-destructive', label: 'بيع' };
      case 'Hold':
      default:
        return { Icon: Shield, color: 'text-blue-500', label: 'احتفاظ' };
    }
  }, [result]);

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">المحلل المالي الذكي</h1>
        <p className="text-lg text-muted-foreground mt-2">
          احصل على تحليل فوري للأسهم مدعوم بالذكاء الاصطناعي وأدوات بحث متقدمة.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تحليل سهم</CardTitle>
          <CardDescription>اختر سهمًا من القائمة للحصول على تحليل شامل.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Select onValueChange={(value) => setValue('ticker', value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر سهمًا من السوق..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableAssetsGrouped).map(([country, assetsInCategory]) => (
                    <SelectGroup key={country}>
                      <SelectLabel>{country === 'SA' ? 'السعودية' : country === 'AE' ? 'الإمارات' : 'قطر'}</SelectLabel>
                      {assetsInCategory.map(asset => (
                        <SelectItem key={asset.ticker} value={asset.ticker}>
                          {asset.name} ({asset.ticker})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              {errors.ticker && <p className="text-sm text-destructive">{errors.ticker.message}</p>}
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  حلل السهم
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isGenerating && !result && (
        <div className="text-center p-8 space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">يقوم المحلل الافتراضي بجمع البيانات وتحليلها...</p>
        </div>
      )}

      {result && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              تحليل سهم: {result.companyName} ({result.ticker})
            </CardTitle>
            <CardDescription>
              تم إنشاء هذا التحليل بواسطة الذكاء الاصطناعي بناءً على بيانات السوق والأخبار المتاحة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <Alert className={`${recommendationStyle.color.replace('text-', 'border-')} bg-opacity-10`}>
              <recommendationStyle.Icon className={`h-5 w-5 ${recommendationStyle.color}`} />
              <AlertTitle className={`font-bold text-lg ${recommendationStyle.color}`}>
                الخلاصة: {recommendationStyle.label} (الثقة: {result.recommendation.confidenceScore}/10)
              </AlertTitle>
              <AlertDescription>
                {result.recommendation.justification}
              </AlertDescription>
            </Alert>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                التحليل المالي
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.financialAnalysis}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                ملخص الأخبار
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.newsSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
