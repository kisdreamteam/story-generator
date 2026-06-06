import type { Session, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { resetStoryStorageAdapterLog } from '@/features/story-generator/lib/storage/resolveStoryStorageAdapter'
import { AuthContext, type AuthContextValue } from './authContext'
import { ensureProfileRow } from './ensureProfileRow'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured())

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    let isMounted = true

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      resetStoryStorageAdapterLog()
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Sign-in is unavailable — Supabase is not configured.')
    }

    resetStoryStorageAdapterLog()
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      await ensureProfileRow(data.user)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Sign-up is unavailable — Supabase is not configured.')
    }

    resetStoryStorageAdapterLog()
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user && data.session) {
      await ensureProfileRow(data.user)
      return { needsEmailConfirmation: false }
    }

    return { needsEmailConfirmation: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return

    resetStoryStorageAdapterLog()
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: Boolean(user),
      isAuthAvailable: isSupabaseConfigured(),
      signIn,
      signUp,
      signOut,
    }),
    [user, session, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
