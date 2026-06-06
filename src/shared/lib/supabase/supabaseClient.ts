import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const MISSING_ENV_MESSAGE =
  'Missing Supabase configuration. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (anon/public key only — never the service role key).'

let client: SupabaseClient | null = null

function readSupabaseEnv(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    throw new Error(MISSING_ENV_MESSAGE)
  }

  return { url, anonKey }
}

/** True when both public Supabase env vars are set (does not validate connectivity). */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && anonKey)
}

/** Lazy singleton Supabase client using the anon key only. */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = readSupabaseEnv()
    client = createClient(url, anonKey)
  }

  return client
}
