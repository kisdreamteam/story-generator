import { getSupabaseClient, isSupabaseConfigured } from '@/shared/lib/supabase/supabaseClient'
import type { StoryStorageAdapterAsync } from './StoryStorageAdapter'
import { localStoryStorageAdapterAsync } from './localStoryStorageAdapter'

type AdapterKind = 'local' | 'supabase'

let lastLoggedKind: AdapterKind | null = null

/** Env flag — default off; set VITE_ENABLE_SUPABASE_STORIES=true to allow cloud storage when signed in. */
export function isSupabaseStoriesEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_SUPABASE_STORIES === 'true'
}

function logAdapterChoice(kind: AdapterKind): void {
  if (!import.meta.env.DEV) return
  if (lastLoggedKind === kind) return
  lastLoggedKind = kind
  console.info(`[Story Storage] Using ${kind} adapter`)
}

/** Dev/test helper — force next resolve to log adapter choice again (e.g. after sign-out). */
export function resetStoryStorageAdapterLog(): void {
  lastLoggedKind = null
}

async function isAuthenticatedSupabaseUser(): Promise<boolean> {
  const supabase = getSupabaseClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) return false
  return Boolean(session?.user)
}

/**
 * Choose storage backend for this operation.
 * Supabase only when flag + env + signed-in user; otherwise local (default/fallback).
 */
export async function resolveStoryStorageAdapter(): Promise<StoryStorageAdapterAsync> {
  if (!isSupabaseStoriesEnabled() || !isSupabaseConfigured()) {
    logAdapterChoice('local')
    return localStoryStorageAdapterAsync
  }

  try {
    if (await isAuthenticatedSupabaseUser()) {
      const { supabaseStoryStorageAdapter } = await import('./supabaseStoryStorageAdapter')
      logAdapterChoice('supabase')
      return supabaseStoryStorageAdapter
    }
  } catch {
    // Missing env, client init, or auth read failed — fall back to local.
  }

  logAdapterChoice('local')
  return localStoryStorageAdapterAsync
}
