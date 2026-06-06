import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  StoryVersionContent,
  StoryVersionHistory,
  StoryVersionReason,
  StoryVersionStore,
  StoryVersionSummary,
} from '../types/storyVersion.types'
import {
  createStoryVersionHistory,
  restoreStoryVersion,
  seedStoryVersionHistory,
  snapshotBeforeMajorEdit,
  toVersionSummaries,
} from '../utils/storyVersionUtils'

export interface UseStoryVersionHistoryOptions {
  storyId: string
  /** Initial story content when the editor session opens. */
  initialContent?: StoryVersionContent | null
  maxVersions?: number
  /** Optional persistence — history stays in memory when omitted. */
  store?: StoryVersionStore
}

export interface UseStoryVersionHistoryResult {
  summaries: StoryVersionSummary[]
  snapshotBeforeMajorEdit: (
    content: StoryVersionContent,
    reason: StoryVersionReason,
    detail?: string,
  ) => void
  restoreVersion: (versionId: string) => StoryVersionContent | null
  history: StoryVersionHistory
}

export function useStoryVersionHistory({
  storyId,
  initialContent,
  maxVersions,
  store,
}: UseStoryVersionHistoryOptions): UseStoryVersionHistoryResult {
  const [history, setHistory] = useState<StoryVersionHistory>(() =>
    createStoryVersionHistory(storyId, { maxVersions }),
  )
  const historyRef = useRef(history)
  historyRef.current = history

  useEffect(() => {
    setHistory(createStoryVersionHistory(storyId, { maxVersions }))
  }, [storyId, maxVersions])

  useEffect(() => {
    if (!storyId || !store) return

    let cancelled = false

    void store.load(storyId).then((loaded) => {
      if (cancelled) return
      if (loaded) {
        setHistory(loaded)
      }
    })

    return () => {
      cancelled = true
    }
  }, [storyId, store])

  useEffect(() => {
    if (!initialContent || !storyId) return

    setHistory((current) => {
      if (current.storyId !== storyId) {
        return current
      }
      return seedStoryVersionHistory(current, initialContent).history
    })
  }, [storyId, initialContent])

  const persistHistory = useCallback(
    (next: StoryVersionHistory) => {
      if (store) {
        void store.save(next)
      }
    },
    [store],
  )

  const captureSnapshot = useCallback(
    (content: StoryVersionContent, reason: StoryVersionReason, detail?: string) => {
      setHistory((current) => {
        const result = snapshotBeforeMajorEdit(current, content, reason, detail)
        persistHistory(result.history)
        return result.history
      })
    },
    [persistHistory],
  )

  const restoreVersion = useCallback((versionId: string): StoryVersionContent | null => {
    const result = restoreStoryVersion(historyRef.current, versionId)
    return result?.restoredContent ?? null
  }, [])

  const summaries = useMemo(() => toVersionSummaries(history), [history])

  return {
    summaries,
    snapshotBeforeMajorEdit: captureSnapshot,
    restoreVersion,
    history,
  }
}
