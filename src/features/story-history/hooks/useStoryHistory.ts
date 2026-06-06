import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GeneratedStory } from '@/features/stories/types'
import { loadStoryHistory } from '../api/storyHistoryApi'
import type { StoryHistory, StoryHistorySummary, StoryVersionComparison } from '../types/storyHistory.types'
import {
  compareStoryHistoryEntries,
  compareStoryHistoryEntryToCurrent,
  createStoryHistory,
  findStoryHistoryEntry,
  restoreStoryHistoryEntry,
  toStoryHistorySummaries,
} from '../lib/storyHistoryUtils'

export interface UseStoryHistoryOptions {
  storyId: string
  maxEntries?: number
  /** Current working copy — enables compare-to-current. */
  currentStory?: GeneratedStory | null
}

export interface UseStoryHistoryResult {
  summaries: StoryHistorySummary[]
  history: StoryHistory
  isLoading: boolean
  refresh: () => Promise<void>
  restoreEntry: (entryId: string) => GeneratedStory | null
  compareEntries: (leftEntryId: string, rightEntryId: string) => StoryVersionComparison | null
  compareEntryToCurrent: (entryId: string) => StoryVersionComparison | null
}

export function useStoryHistory({
  storyId,
  maxEntries,
  currentStory,
}: UseStoryHistoryOptions): UseStoryHistoryResult {
  const [history, setHistory] = useState<StoryHistory>(() =>
    createStoryHistory(storyId, { maxEntries }),
  )
  const [isLoading, setIsLoading] = useState(false)
  const historyRef = useRef(history)
  historyRef.current = history

  const refresh = useCallback(async () => {
    if (!storyId) {
      setHistory(createStoryHistory('', { maxEntries }))
      return
    }

    setIsLoading(true)
    try {
      const loaded = await loadStoryHistory(storyId)
      setHistory(loaded)
    } finally {
      setIsLoading(false)
    }
  }, [maxEntries, storyId])

  useEffect(() => {
    setHistory(createStoryHistory(storyId, { maxEntries }))
    void refresh()
  }, [maxEntries, refresh, storyId])

  const restoreEntry = useCallback((entryId: string): GeneratedStory | null => {
    const result = restoreStoryHistoryEntry(historyRef.current, entryId)
    return result?.restoredContent ?? null
  }, [])

  const compareEntries = useCallback(
    (leftEntryId: string, rightEntryId: string): StoryVersionComparison | null => {
      const left = findStoryHistoryEntry(historyRef.current, leftEntryId)
      const right = findStoryHistoryEntry(historyRef.current, rightEntryId)
      if (!left || !right) return null
      return compareStoryHistoryEntries(left, right)
    },
    [],
  )

  const compareEntryToCurrent = useCallback(
    (entryId: string): StoryVersionComparison | null => {
      if (!currentStory) return null
      const entry = findStoryHistoryEntry(historyRef.current, entryId)
      if (!entry) return null
      return compareStoryHistoryEntryToCurrent(entry, currentStory)
    },
    [currentStory],
  )

  const summaries = useMemo(() => toStoryHistorySummaries(history), [history])

  return {
    summaries,
    history,
    isLoading,
    refresh,
    restoreEntry,
    compareEntries,
    compareEntryToCurrent,
  }
}
