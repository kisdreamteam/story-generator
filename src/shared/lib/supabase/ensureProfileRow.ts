import type { User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

/** Upsert teacher profile row after sign-in / sign-up (when Auth trigger is disabled). */
export async function ensureProfileRow(user: User): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabaseClient()
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split('@')[0] ??
        null,
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw new Error(`Failed to create teacher profile: ${error.message}`)
  }
}
