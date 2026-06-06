import { checkSupabaseConnection } from './checkSupabaseConnection'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'
import {
  isSupabaseStoriesEnabled,
  resetStoryStorageAdapterLog,
} from '@/features/story-generator/lib/storage/resolveStoryStorageAdapter'

/** Sign in a test teacher account (dev console only — no app auth UI yet). */
export async function devCloudSignIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  resetStoryStorageAdapterLog()
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(`Cloud sign-in failed: ${error.message}`)
  }

  return data
}

/** Sign out and fall back to local storage on the next operation. */
export async function devCloudSignOut() {
  if (!isSupabaseConfigured()) return

  resetStoryStorageAdapterLog()
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Cloud sign-out failed: ${error.message}`)
  }
}

/** Inspect which adapter resolveStoryStorageAdapter() would choose right now. */
export async function devGetActiveStorageAdapterKind(): Promise<'local' | 'supabase'> {
  if (!isSupabaseStoriesEnabled() || !isSupabaseConfigured()) {
    return 'local'
  }

  try {
    const supabase = getSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.user ? 'supabase' : 'local'
  } catch {
    return 'local'
  }
}

/** Quick readiness check for cloud story storage testing. */
export async function devCloudStorageStatus() {
  const connection = await checkSupabaseConnection()
  const adapterKind = await devGetActiveStorageAdapterKind()

  return {
    featureFlagEnabled: isSupabaseStoriesEnabled(),
    supabaseConfigured: isSupabaseConfigured(),
    connection,
    adapterKind,
  }
}

export const devCloudStorageHelp = {
  signIn: 'await __storyCloudTest.devCloudSignIn("teacher@example.com", "password")',
  status: 'await __storyCloudTest.devCloudStorageStatus()',
  signOut: 'await __storyCloudTest.devCloudSignOut()',
}
