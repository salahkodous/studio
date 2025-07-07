'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebase } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const firebase = getFirebase();
    if (firebase?.auth) {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user)
        setLoading(false)
      })
  
      return () => unsubscribe()
    } else {
      // Firebase is not configured
      setLoading(false);
    }
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
