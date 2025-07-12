
// This is a new file for a simple admin panel.
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const functions = getFunctions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  const handleUpdatePrices = async () => {
    setLoading(true);
    toast({
      title: 'بدء التحديث...',
      description: 'تم إرسال طلب لتحديث أسعار الأسهم. قد تستغرق هذه العملية عدة دقائق.',
    });
    try {
      const runPriceUpdateNow = httpsCallable(functions, 'runPriceUpdateNow');
      const result = await runPriceUpdateNow();
      console.log('Function result:', result.data);
      toast({
        title: 'اكتمل التحديث بنجاح',
        description: 'تم تحديث أسعار الأسهم في قاعدة البيانات.',
      });
    } catch (error: any) {
      console.error('Error calling update function:', error);
      toast({
        title: 'حدث خطأ',
        description: `فشل في تحديث الأسعار: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || !user) {
    // Render a loading state or null while checking auth
    return (
        <div className="container mx-auto flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-6">لوحة التحكم</h1>
      <Card>
        <CardHeader>
          <CardTitle>تحديث بيانات السوق</CardTitle>
          <CardDescription>
            استخدم هذا الزر لبدء عملية تحديث أسعار الأسهم لجميع الأصول في النظام يدويًا. 
            سيقوم النظام بكشط أحدث أسعار الإغلاق وتخزينها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleUpdatePrices} disabled={loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تحديث الأسعار...
              </>
            ) : (
              'تحديث الأسعار الآن'
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            ملاحظة: يتم تشغيل هذه العملية تلقائيًا كل 24 ساعة. استخدم هذا الزر فقط للتحديثات الفورية.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
