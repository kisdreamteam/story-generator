import type { StoryLifecycleStatus } from '../types/storyLifecycle.types'
import { STORY_LIFECYCLE_STATUS_LABELS } from '../types/storyLifecycle.types'
import { getStoryLifecycleBadgeClasses } from '../utils/storyLifecycleStatus'
import { getStoryStatusBadgeClasses } from '../utils/storyFormat'

interface StoryStatusBadgeProps {
  /** Display label override — e.g. "Sample story". */
  label?: string
  /** Lifecycle status — preferred for consistent badge styling. */
  status?: StoryLifecycleStatus
  className?: string
}

/** Consistent status pill for story cards, detail header, and create flow. */
export function StoryStatusBadge({ label, status, className = '' }: StoryStatusBadgeProps) {
  const displayLabel =
    label ?? (status ? STORY_LIFECYCLE_STATUS_LABELS[status] : 'Draft')
  const badgeClasses = status
    ? getStoryLifecycleBadgeClasses(status)
    : getStoryStatusBadgeClasses(displayLabel)

  return (
    <span
      role="status"
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses} ${className}`.trim()}
    >
      {displayLabel}
    </span>
  )
}
