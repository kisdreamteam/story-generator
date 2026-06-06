import {
  getSaveStatusPresentation,
  type SaveStatus,
} from '@/shared/lib/autosave/saveStatus'

export interface SaveStatusIndicatorProps {
  status: SaveStatus
  className?: string
}

const toneClasses: Record<Exclude<SaveStatus, 'idle'>, string> = {
  pending: 'bg-amber-50 text-amber-900 ring-amber-200',
  saving: 'bg-sky-50 text-sky-900 ring-sky-200',
  saved: 'bg-brand-50 text-brand-800 ring-brand-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
}

export function SaveStatusIndicator({ status, className = '' }: SaveStatusIndicatorProps) {
  const presentation = getSaveStatusPresentation(status)

  if (!presentation.isVisible) {
    return null
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1',
        toneClasses[status as Exclude<SaveStatus, 'idle'>],
        className,
      ].join(' ')}
    >
      {presentation.label}
    </span>
  )
}
