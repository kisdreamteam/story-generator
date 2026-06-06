import { displayDetailValue } from '../../utils/storyDetailView'
import { StoryStatusBadge } from '../StoryStatusBadge'
import type { StoryHeaderProps } from './types'

export function StoryHeader({
  title,
  statusLabel,
  summary,
  pageCount,
  totalWordCount,
  hideReadOnlyBadge = false,
}: StoryHeaderProps) {
  const summaryText = displayDetailValue(summary, 'No story summary yet.')

  return (
    <header className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold leading-snug text-stone-900 sm:text-2xl">{title}</h2>
        <StoryStatusBadge label={statusLabel} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{summaryText}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 sm:text-sm">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
        {totalWordCount > 0 && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 sm:text-sm">
            {totalWordCount} words
          </span>
        )}
        {!hideReadOnlyBadge && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:text-sm">
            Ready for class
          </span>
        )}
      </div>
    </header>
  )
}
