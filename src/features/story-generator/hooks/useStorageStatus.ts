import { useAuth } from '@/shared/lib/supabase/useAuth'
import { useMemo } from 'react'
import { getStorageStatusSnapshot, type StorageStatus } from '../lib/storage/storageStatus'

/** Teacher-facing storage mode — mirrors resolveStoryStorageAdapter() without calling it. */
export function useStorageStatus(): StorageStatus {
  const { isAuthenticated, isLoading, isAuthAvailable } = useAuth()

  return useMemo(
    () =>
      getStorageStatusSnapshot({
        isAuthLoading: isLoading,
        isAuthenticated,
        isAuthAvailable,
      }),
    [isLoading, isAuthenticated, isAuthAvailable],
  )
}
