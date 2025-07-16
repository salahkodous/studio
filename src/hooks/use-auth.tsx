'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { onIdTokenChanged, type User } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

async function setSessionCookie(idToken: string | null) {
  if (idToken) {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  } else {
    await fetch('/api/auth/logout', { method: 'POST' });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();
        await setSessionCookie(idToken);
      } else {
        setUser(null);
        await setSessionCookie(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
