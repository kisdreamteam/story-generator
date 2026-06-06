import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

export interface SupabaseConnectionCheckResult {
  ok: boolean
  configured: boolean
  hasSession: boolean
  error?: string
}

/**
 * Harmless connectivity check — reads auth session only.
 * Does not query story tables or require a signed-in user.
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionCheckResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      hasSession: false,
      error:
        'Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    }
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return {
        ok: false,
        configured: true,
        hasSession: false,
        error: error.message,
      }
    }

    return {
      ok: true,
      configured: true,
      hasSession: Boolean(data.session),
    }
  } catch (err) {
    return {
      ok: false,
      configured: true,
      hasSession: false,
      error: err instanceof Error ? err.message : 'Unknown Supabase connection error',
    }
  }
}
