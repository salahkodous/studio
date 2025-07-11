
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DatabaseZap } from 'lucide-react';
import { extractAndStoreMarketData } from '@/ai/flows/extract-market-data';

const markets = [
    {
        id: 'TADAWUL_ALL_SHARES',
        name: 'Tadawul (All Shares)',
        url: 'https://www.saudiexchange.sa/wps/portal/saudiexchange/our-markets/equities?locale=en'
    },
    // Add other market URLs here in the future
];

export default function AdminPage() {
  const [loadingMarketId, setLoadingMarketId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExtract = async (marketId: string, marketUrl: string) => {
    setLoadingMarketId(marketId);
    try {
      const result = await extractAndStoreMarketData({ marketId, marketUrl });
      if (result.success) {
        toast({
          title: 'Extraction Successful',
          description: `Successfully extracted and stored ${result.count} assets for ${result.marketId}.`,
        });
      } else {
        throw new Error('Extraction process returned no assets.');
      }
    } catch (error) {
      console.error('Extraction failed:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMarketId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Admin Control Panel</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Use these tools to manage the application's data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Data Extraction</CardTitle>
          <CardDescription>
            Trigger the AI extraction process to scrape official market websites and populate the Firestore database with asset names and tickers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {markets.map((market) => (
            <div key={market.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{market.name}</h3>
                <p className="text-sm text-muted-foreground">{market.url}</p>
              </div>
              <Button
                onClick={() => handleExtract(market.id, market.url)}
                disabled={!!loadingMarketId}
                className="w-full sm:w-auto"
              >
                {loadingMarketId === market.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <DatabaseZap className="mr-2 h-4 w-4" />
                    Start Extraction
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
