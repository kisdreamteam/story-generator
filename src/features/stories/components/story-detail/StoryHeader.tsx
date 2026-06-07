import { displayDetailValue } from '../../utils/storyDetailView'
import { AppBadge } from '@/shared/components'
import { panelShellClass } from '@/shared/styles/surfaceClasses'
import { StoryStatusBadge } from '../StoryStatusBadge'
import type { StoryHeaderProps } from './types'

export function StoryHeader({
  title,
  statusLabel,
  summary,
  pageCount,
  totalWordCount,
  versionBadge,
  updatedAtLabel,
  hideReadOnlyBadge = false,
}: StoryHeaderProps) {
  const summaryText = displayDetailValue(summary, 'No story summary yet.')

  return (
    <header className={`${panelShellClass} p-4 shadow-sm sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold leading-snug text-stone-900 sm:text-2xl">{title}</h2>
        <StoryStatusBadge label={statusLabel} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{summaryText}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <AppBadge>
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </AppBadge>
        {totalWordCount > 0 ? <AppBadge>{totalWordCount} words</AppBadge> : null}
        {versionBadge ? <AppBadge tone="brand">{versionBadge}</AppBadge> : null}
        {updatedAtLabel ? <AppBadge tone="muted">Updated {updatedAtLabel}</AppBadge> : null}
        {!hideReadOnlyBadge ? <AppBadge tone="brand">Ready for class</AppBadge> : null}
      </div>
    </header>
  )
}
