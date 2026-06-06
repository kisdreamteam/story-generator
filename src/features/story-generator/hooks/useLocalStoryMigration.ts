import { useCallback, useEffect, useState } from 'react'
import { detectPendingLocalStoryMigration } from '../lib/migration/detectLocalStoryMigration'
import {
  dismissLocalStoryMigrationPrompt,
  isLocalStoryMigrationDismissed,
} from '../lib/migration/localStoryMigrationDismissal'
import {
  copyLocalStoriesToCloud,
  type LocalStoryMigrationCopyResult,
} from '../lib/migration/migrateLocalStoriesToCloud'
import type { StoryProject } from '../types/story-generator.types'
import { useStorageStatus } from './useStorageStatus'

export type LocalStoryMigrationUiState =
  | 'checking'
  | 'idle'
  | 'available'
  | 'migrating'
  | 'success'
  | 'partial_success'
  | 'failed'
  | 'dismissed'

export interface UseLocalStoryMigrationResult {
  uiState: LocalStoryMigrationUiState
  pendingCount: number
  pendingStories: StoryProject[]
  lastResult: LocalStoryMigrationCopyResult | null
  dismiss: () => void
  migrate: () => Promise<void>
  recheck: () => Promise<void>
}

export function useLocalStoryMigration(): UseLocalStoryMigrationResult {
  const storageStatus = useStorageStatus()
  const cloudStorageActive = storageStatus.adapter === 'supabase' && !storageStatus.isLoading

  const [uiState, setUiState] = useState<LocalStoryMigrationUiState>('checking')
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingStories, setPendingStories] = useState<StoryProject[]>([])
  const [fingerprint, setFingerprint] = useState('')
  const [lastResult, setLastResult] = useState<LocalStoryMigrationCopyResult | null>(null)

  const recheck = useCallback(async () => {
    if (storageStatus.isLoading) {
      setUiState('checking')
      return
    }

    if (!cloudStorageActive) {
      setUiState('idle')
      setPendingCount(0)
      setPendingStories([])
      setFingerprint('')
      return
    }

    setUiState((current) => (current === 'migrating' ? current : 'checking'))

    const detection = await detectPendingLocalStoryMigration({ cloudStorageActive: true })

    setPendingCount(detection.pendingCount)
    setPendingStories(detection.pendingStories)
    setFingerprint(detection.fingerprint)

    if (!detection.eligible) {
      setUiState((current) =>
        current === 'success' || current === 'partial_success' || current === 'failed'
          ? current
          : 'idle',
      )
      return
    }

    if (isLocalStoryMigrationDismissed(detection.fingerprint)) {
      setUiState('dismissed')
      return
    }

    setUiState((current) => (current === 'migrating' ? current : 'available'))
  }, [cloudStorageActive, storageStatus.isLoading])

  useEffect(() => {
    void recheck()
  }, [recheck, storageStatus.isSignedIn, storageStatus.adapter])

  const dismiss = useCallback(() => {
    if (fingerprint) {
      dismissLocalStoryMigrationPrompt(fingerprint)
    }
    setUiState('dismissed')
  }, [fingerprint])

  const migrate = useCallback(async () => {
    if (pendingStories.length === 0) return

    setUiState('migrating')
    setLastResult(null)

    const result = await copyLocalStoriesToCloud(pendingStories)
    setLastResult(result)

    if (result.failed.length === 0 && result.copied > 0) {
      setUiState('success')
      setPendingCount(0)
      setPendingStories([])
    } else if (result.failed.length > 0 && result.copied > 0) {
      setUiState('partial_success')
      const failedIds = new Set(result.failed.map((failure) => failure.localId))
      const remaining = pendingStories.filter((story) => failedIds.has(story.id))
      setPendingStories(remaining)
      setPendingCount(remaining.length)
    } else if (result.failed.length > 0) {
      setUiState('failed')
    } else {
      setUiState('idle')
    }
  }, [pendingStories])

  return {
    uiState,
    pendingCount,
    pendingStories,
    lastResult,
    dismiss,
    migrate,
    recheck,
  }
}
