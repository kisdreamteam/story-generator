import { useCallback, useMemo, useRef } from 'react'
import { useStoryHistory } from '@/features/story-history'
import type { StoryRevisionHistory, StoryRevisionSummary } from '../types/storyRevision.types'
import { createStoryRevisionHistory } from '../utils/storyRevisionUtils'

export interface UseStoryRevisionsOptions {
  storyId: string
  maxRevisions?: number
}

export interface UseStoryRevisionsResult {
  summaries: StoryRevisionSummary[]
  history: StoryRevisionHistory
  isLoading: boolean
  refresh: () => Promise<void>
  restoreRevision: (revisionId: string) => ReturnType<typeof useStoryHistory>['restoreEntry'] extends (
    id: string,
  ) => infer R
    ? R
    : never
}

function toRevisionHistory(
  storyId: string,
  maxRevisions: number | undefined,
  history: ReturnType<typeof useStoryHistory>['history'],
): StoryRevisionHistory {
  return {
    storyId,
    maxRevisions: history.maxEntries ?? maxRevisions ?? 10,
    revisions: history.entries.map((entry) => ({
      id: entry.id,
      storyId: entry.storyId,
      revisionAt: entry.recordedAt,
      storyCreatedAt: entry.storyCreatedAt,
      storyUpdatedAt: entry.storyUpdatedAt,
      contentHash: entry.contentHash,
      label: entry.label,
      snapshot: entry.snapshot,
    })),
  }
}

/** @deprecated Prefer useStoryHistory from @/features/story-history */
export function useStoryRevisions({
  storyId,
  maxRevisions,
}: UseStoryRevisionsOptions): UseStoryRevisionsResult {
  const {
    summaries: historySummaries,
    history: storyHistory,
    isLoading,
    refresh,
    restoreEntry,
  } = useStoryHistory({
    storyId,
    maxEntries: maxRevisions,
  })

  const history = useMemo(
    () => toRevisionHistory(storyId, maxRevisions, storyHistory),
    [maxRevisions, storyHistory, storyId],
  )

  const summaries = useMemo(
    (): StoryRevisionSummary[] =>
      historySummaries.map((entry) => ({
        id: entry.id,
        storyId: entry.storyId,
        revisionAt: entry.recordedAt,
        formattedRevisionAt: entry.formattedRecordedAt,
        storyCreatedAt: entry.storyCreatedAt,
        storyUpdatedAt: entry.storyUpdatedAt,
        label: entry.label,
      })),
    [historySummaries],
  )

  const historyRef = useRef(history)
  historyRef.current = history

  const restoreRevision = useCallback(
    (revisionId: string) => restoreEntry(revisionId),
    [restoreEntry],
  )

  if (!storyId && history.storyId !== '') {
    return {
      summaries: [],
      history: createStoryRevisionHistory(''),
      isLoading,
      refresh,
      restoreRevision,
    }
  }

  return {
    summaries,
    history,
    isLoading,
    refresh,
    restoreRevision,
  }
}
