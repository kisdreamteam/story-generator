import { useCallback, useMemo, useState } from 'react'
import type { GeneratedStory } from '@/features/stories/types'
import type { StoryHistorySummary, StoryVersionComparison } from '../types/storyHistory.types'
import { StoryHistoryList } from './StoryHistoryList'
import { StoryVersionCompare } from './StoryVersionCompare'

export interface StoryHistoryPanelProps {
  entries: StoryHistorySummary[]
  isLoading?: boolean
  disabled?: boolean
  currentStory?: GeneratedStory | null
  onRestore: (entryId: string) => void
  compareEntries: (leftEntryId: string, rightEntryId: string) => StoryVersionComparison | null
  compareEntryToCurrent: (entryId: string) => StoryVersionComparison | null
  className?: string
}

const MAX_COMPARE_SELECTION = 2

export function StoryHistoryPanel({
  entries,
  isLoading = false,
  disabled = false,
  currentStory,
  onRestore,
  compareEntries,
  compareEntryToCurrent,
  className = '',
}: StoryHistoryPanelProps) {
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([])
  const [compareToCurrentId, setCompareToCurrentId] = useState<string | null>(null)

  const handleToggleSelect = useCallback((entryId: string) => {
    setCompareToCurrentId(null)
    setSelectedEntryIds((current) => {
      if (current.includes(entryId)) {
        return current.filter((id) => id !== entryId)
      }

      if (current.length >= MAX_COMPARE_SELECTION) {
        return [current[1], entryId]
      }

      return [...current, entryId]
    })
  }, [])

  const handleCompareToCurrent = useCallback((entryId: string) => {
    setSelectedEntryIds([])
    setCompareToCurrentId(entryId)
  }, [])

  const comparison = useMemo(() => {
    if (compareToCurrentId && currentStory) {
      return compareEntryToCurrent(compareToCurrentId)
    }

    if (selectedEntryIds.length === MAX_COMPARE_SELECTION) {
      return compareEntries(selectedEntryIds[0], selectedEntryIds[1])
    }

    return null
  }, [
    compareEntries,
    compareEntryToCurrent,
    compareToCurrentId,
    currentStory,
    selectedEntryIds,
  ])

  const leftLabel = useMemo(() => {
    if (compareToCurrentId) {
      const entry = entries.find((item) => item.id === compareToCurrentId)
      return entry?.formattedRecordedAt ?? 'Selected version'
    }

    const entry = entries.find((item) => item.id === selectedEntryIds[0])
    return entry?.formattedRecordedAt ?? 'First version'
  }, [compareToCurrentId, entries, selectedEntryIds])

  const rightLabel = useMemo(() => {
    if (compareToCurrentId) {
      return 'Current working copy'
    }

    const entry = entries.find((item) => item.id === selectedEntryIds[1])
    return entry?.formattedRecordedAt ?? 'Second version'
  }, [compareToCurrentId, entries, selectedEntryIds])

  if (!isLoading && entries.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <StoryHistoryList
        entries={entries}
        selectedEntryIds={selectedEntryIds}
        onToggleSelect={handleToggleSelect}
        onRestore={onRestore}
        onCompareToCurrent={currentStory ? handleCompareToCurrent : undefined}
        disabled={disabled}
        isLoading={isLoading}
      />

      {comparison || selectedEntryIds.length > 0 || compareToCurrentId ? (
        <StoryVersionCompare comparison={comparison} leftLabel={leftLabel} rightLabel={rightLabel} />
      ) : null}
    </div>
  )
}
