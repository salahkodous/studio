
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
import { auth as serverAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import type { User } from 'firebase/auth';
import { getAllStocks, type Asset } from '@/lib/stocks';


async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const sessionCookie = cookies().get('__session')?.value || '';
    if (!sessionCookie) return null;

    getFirebaseAdminApp(); // Ensure admin app is initialized
    const decodedIdToken = await serverAuth().verifySessionCookie(sessionCookie, true);
    
    // The decoded token has the user data we need. We can shape it to match the client-side User type.
    return {
        uid: decodedIdToken.uid,
        email: decodedIdToken.email,
        displayName: decodedIdToken.name,
        photoURL: decodedIdToken.picture,
    } as User;
    
  } catch (error) {
    // Session cookie is invalid or expired.
    // console.error('Authentication error:', error);
    return null;
  }
}


export default async function HomePage() {
  const user = await getAuthenticatedUser();
  const allStocks: Asset[] = await getAllStocks();
  
  if (!user) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-[calc(100vh-8rem)] p-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-primary via-amber-400 to-yellow-500 text-transparent bg-clip-text">
            استثمر في المستقبل. استثمر في الخليج.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            "ثروات" هو شريكك الذكي لاستكشاف الفرص الواعدة في أسواق الخليج. احصل على استراتيجيات مخصصة، وقم ببناء وتتبع محافظك الاستثمارية بسهولة ودقة.
          </p>
          <Button asChild size="lg">
            <Link href="/guide">
              اكتشف مستقبلك المالي
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} allStocks={allStocks} />
}
