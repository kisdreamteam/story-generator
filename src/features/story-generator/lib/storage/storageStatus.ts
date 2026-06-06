import { isSupabaseConfigured } from '@/shared/lib/supabase/supabaseClient'
import { isSupabaseStoriesEnabled } from './resolveStoryStorageAdapter'

export type StorageAdapterKind = 'local' | 'supabase'

export type StorageStatusReason =
  | 'checking'
  | 'cloud-active'
  | 'local-default'
  | 'feature-flag-disabled'
  | 'missing-configuration'
  | 'not-signed-in'

export interface StorageStatus {
  adapter: StorageAdapterKind
  isSignedIn: boolean
  cloudEnabled: boolean
  isLoading: boolean
  message: string
  reason: StorageStatusReason
  badgeLabel: string
}

interface StorageStatusInput {
  isAuthLoading: boolean
  isAuthenticated: boolean
  isAuthAvailable: boolean
}

/**
 * Sync snapshot aligned with resolveStoryStorageAdapter() decision tree.
 * Uses auth session from AuthProvider — same inputs the resolver checks via getSession().
 */
export function getStorageStatusSnapshot(input: StorageStatusInput): StorageStatus {
  const { isAuthLoading, isAuthenticated, isAuthAvailable } = input
  const flagEnabled = isSupabaseStoriesEnabled()
  const configured = isSupabaseConfigured()
  const cloudEnabled = flagEnabled && configured

  if (isAuthLoading) {
    return {
      adapter: 'local',
      isSignedIn: false,
      cloudEnabled,
      isLoading: true,
      reason: 'checking',
      badgeLabel: 'Checking…',
      message: 'Checking where your stories are saved…',
    }
  }

  if (!isAuthAvailable || !configured) {
    return {
      adapter: 'local',
      isSignedIn: isAuthenticated,
      cloudEnabled: false,
      isLoading: false,
      reason: 'missing-configuration',
      badgeLabel: 'Saved here',
      message: isAuthenticated
        ? 'You are signed in. New stories save in this browser until online saving is set up.'
        : 'Stories are saved in this browser on this computer.',
    }
  }

  if (!flagEnabled) {
    return {
      adapter: 'local',
      isSignedIn: isAuthenticated,
      cloudEnabled: false,
      isLoading: false,
      reason: 'feature-flag-disabled',
      badgeLabel: 'Saved here',
      message: isAuthenticated
        ? 'You are signed in. New stories save in this browser for now.'
        : 'Stories are saved in this browser on this computer.',
    }
  }

  if (isAuthenticated) {
    return {
      adapter: 'supabase',
      isSignedIn: true,
      cloudEnabled: true,
      isLoading: false,
      reason: 'cloud-active',
      badgeLabel: 'Your account',
      message: 'New stories save to your teacher account.',
    }
  }

  return {
    adapter: 'local',
    isSignedIn: false,
    cloudEnabled: true,
    isLoading: false,
    reason: 'not-signed-in',
    badgeLabel: 'Saved here',
    message: 'Sign in to keep stories in your account and open them anywhere.',
  }
}
