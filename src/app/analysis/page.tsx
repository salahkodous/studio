
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, TrendingUp, Newspaper, Shield, BadgeCheck, AlertTriangle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { analyzeMarketForTicker } from '@/ai/flows/market-analyst-flow';
import type { MarketAnalysis } from '@/ai/schemas/market-analysis-schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  ticker: z.string().min(2, 'الرجاء إدخال رمز سهم صالح.').max(20, 'رمز السهم طويل جدًا.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnalysisPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MarketAnalysis | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setResult(null);
    setIsGenerating(true);

    try {
      const finalResult = await analyzeMarketForTicker({ ticker: data.ticker.toUpperCase() });
      setResult(finalResult);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من إنشاء التحليل. قد يكون رمز السهم غير صالح أو أن الخدمة تواجه ضغطًا. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const recommendationStyle = result ? {
    'Buy': { Icon: BadgeCheck, color: 'text-success', label: 'شراء' },
    'Sell': { Icon: AlertTriangle, color: 'text-destructive', label: 'بيع' },
    'Hold': { Icon: Shield, color: 'text-blue-500', label: 'احتفاظ' },
  }[result.recommendation.decision] : { Icon: Info, color: 'text-muted-foreground', label: 'غير محدد' };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">المحلل المالي الذكي</h1>
        <p className="text-lg text-muted-foreground mt-2">
          احصل على تحليل فوري لأي سهم في أسواق الخليج باستخدام أدوات الذكاء الاصطناعي المتقدمة.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تحليل سهم</CardTitle>
          <CardDescription>أدخل رمز السهم (Ticker) للحصول على تحليل شامل ومباشر.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">رمز السهم</Label>
              <Input id="ticker" {...register('ticker')} placeholder="مثال: ARAMCO, QNB, EMAAR" />
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
          <p className="text-xs text-muted-foreground">(قد تستغرق هذه العملية لحظات)</p>
        </div>
      )}

      {result && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
              تحليل سهم: {result.companyName} ({result.ticker})
            </CardTitle>
            <CardDescription>
              تم إنشاء هذا التحليل بواسطة الذكاء الاصطناعي بناءً على بيانات السوق والأخبار المتاحة لحظة الطلب.
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
