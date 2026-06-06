import { AppCard } from '@/shared/components'
import type { StoryVersionComparison } from '../types/storyHistory.types'

export interface StoryVersionCompareProps {
  comparison: StoryVersionComparison | null
  leftLabel: string
  rightLabel: string
  className?: string
}

function formatDelta(value: number, unit: string): string {
  if (value === 0) return `No change in ${unit}`
  const sign = value > 0 ? '+' : ''
  return `${sign}${value} ${unit}${Math.abs(value) === 1 ? '' : 's'}`
}

export function StoryVersionCompare({
  comparison,
  leftLabel,
  rightLabel,
  className = '',
}: StoryVersionCompareProps) {
  if (!comparison) {
    return (
      <AppCard padding="md" className={`border-stone-200 bg-white ${className}`.trim()}>
        <p className="text-sm text-stone-600">Select two versions to compare.</p>
      </AppCard>
    )
  }

  const hasChanges =
    comparison.titleChanged ||
    comparison.summaryChanged ||
    comparison.pageCountDelta !== 0 ||
    comparison.flashcardCountDelta !== 0 ||
    comparison.promptCountDelta !== 0 ||
    comparison.wordCountDelta !== 0 ||
    comparison.changedPageNumbers.length > 0

  return (
    <AppCard padding="md" className={`border-stone-200 bg-white ${className}`.trim()}>
      <div className="mb-3 space-y-1">
        <h3 className="text-sm font-semibold text-stone-900">Version comparison</h3>
        <p className="text-xs text-stone-600">
          {leftLabel} → {rightLabel}
        </p>
      </div>

      {!hasChanges ? (
        <p className="text-sm text-stone-600">These versions have identical story content.</p>
      ) : (
        <ul className="space-y-1.5 text-sm text-stone-700">
          {comparison.titleChanged ? <li>Title changed</li> : null}
          {comparison.summaryChanged ? <li>Summary changed</li> : null}
          {comparison.pageCountDelta !== 0 ? (
            <li>{formatDelta(comparison.pageCountDelta, 'page')}</li>
          ) : null}
          {comparison.flashcardCountDelta !== 0 ? (
            <li>{formatDelta(comparison.flashcardCountDelta, 'flashcard')}</li>
          ) : null}
          {comparison.promptCountDelta !== 0 ? (
            <li>{formatDelta(comparison.promptCountDelta, 'illustration note')}</li>
          ) : null}
          {comparison.wordCountDelta !== 0 ? (
            <li>{formatDelta(comparison.wordCountDelta, 'word')}</li>
          ) : null}
          {comparison.changedPageNumbers.length > 0 ? (
            <li>
              Page text changed on page
              {comparison.changedPageNumbers.length === 1 ? '' : 's'}:{' '}
              {comparison.changedPageNumbers.join(', ')}
            </li>
          ) : null}
        </ul>
      )}
    </AppCard>
  )
}
