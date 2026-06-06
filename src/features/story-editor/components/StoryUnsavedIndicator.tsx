export interface StoryUnsavedIndicatorProps {
  visible: boolean
  className?: string
}

export function StoryUnsavedIndicator({ visible, className = '' }: StoryUnsavedIndicatorProps) {
  if (!visible) {
    return null
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={[
        'inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      Unsaved changes
    </span>
  )
}
