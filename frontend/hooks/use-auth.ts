// hooks/use-auth.ts - COMPLETE VERSION
import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  supabase: ReturnType<typeof createClient>
  getAccessToken: () => Promise<string | null>
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mounted) {
        setUser(session?.user ?? null)
        setSession(session)
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setSession(session)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAccessToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies if needed
    })
  }

  return { 
    user, 
    session,
    loading, 
    supabase,
    getAccessToken,
    authenticatedFetch,
    isAuthenticated: !!user
  }
}