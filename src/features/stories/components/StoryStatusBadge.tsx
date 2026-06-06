import { getStoryStatusBadgeClasses } from '../utils/storyFormat'

interface StoryStatusBadgeProps {
  label: string
  className?: string
}

/** Consistent status pill for story cards, detail header, and create flow. */
export function StoryStatusBadge({ label, className = '' }: StoryStatusBadgeProps) {
  return (
    <span
      role="status"
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStoryStatusBadgeClasses(label)} ${className}`.trim()}
    >
      {label}
    </span>
  )
}
