import { AppButton, AppCard } from '@/shared/components'
import type { StoryHistorySummary } from '../types/storyHistory.types'

export interface StoryHistoryListProps {
  entries: StoryHistorySummary[]
  selectedEntryIds: string[]
  onToggleSelect: (entryId: string) => void
  onRestore: (entryId: string) => void
  onCompareToCurrent?: (entryId: string) => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function StoryHistoryList({
  entries,
  selectedEntryIds,
  onToggleSelect,
  onRestore,
  onCompareToCurrent,
  disabled = false,
  isLoading = false,
  className = '',
}: StoryHistoryListProps) {
  if (isLoading) {
    return (
      <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
        <p className="text-sm text-stone-600">Loading story history…</p>
      </AppCard>
    )
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
      <div className="mb-3 space-y-1">
        <h2 className="text-sm font-semibold text-stone-900">Story history</h2>
        <p className="text-xs leading-relaxed text-stone-600">
          Snapshots are saved when you save the story. Select two versions to compare, or restore
          a previous version into your working copy.
        </p>
      </div>

      <ul className="space-y-2">
        {entries.map((entry) => {
          const isSelected = selectedEntryIds.includes(entry.id)

          return (
            <li
              key={entry.id}
              className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(entry.id)}
                  disabled={disabled}
                  aria-label={`Select version from ${entry.formattedRecordedAt}`}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-stone-900">{entry.label}</p>
                  <p className="text-xs text-stone-500">
                    Recorded {entry.formattedRecordedAt}
                    {entry.formattedStoryUpdatedAt !== entry.formattedRecordedAt
                      ? ` · last saved ${entry.formattedStoryUpdatedAt}`
                      : null}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 self-start sm:shrink-0">
                {onCompareToCurrent ? (
                  <AppButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompareToCurrent(entry.id)}
                    disabled={disabled}
                  >
                    Compare to current
                  </AppButton>
                ) : null}
                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onRestore(entry.id)}
                  disabled={disabled}
                >
                  Restore
                </AppButton>
              </div>
            </li>
          )
        })}
      </ul>
    </AppCard>
  )
}
