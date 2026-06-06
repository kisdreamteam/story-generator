import { useStorageStatus } from '@/features/story-generator/hooks/useStorageStatus'

const badgeStyles: Record<string, string> = {
  'cloud-active': 'bg-brand-50 text-brand-800 ring-brand-200',
  'not-signed-in': 'bg-amber-50 text-amber-900 ring-amber-200',
  'feature-flag-disabled': 'bg-stone-100 text-stone-700 ring-stone-200',
  'missing-configuration': 'bg-stone-100 text-stone-700 ring-stone-200',
  'local-default': 'bg-stone-100 text-stone-700 ring-stone-200',
  checking: 'bg-stone-100 text-stone-600 ring-stone-200',
}

interface StorageStatusIndicatorProps {
  /** Hide helper sentence; show badge only (e.g. header). */
  compact?: boolean
  className?: string
}

export function StorageStatusIndicator({ compact, className = '' }: StorageStatusIndicatorProps) {
  const status = useStorageStatus()
  const style = badgeStyles[status.reason] ?? badgeStyles['local-default']

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()} role="status" aria-live="polite">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            status.adapter === 'supabase' ? 'bg-brand-500' : 'bg-stone-400'
          }`}
          aria-hidden="true"
        />
        {status.badgeLabel}
      </span>
      {!compact && (
        <p className="text-sm text-stone-600">{status.message}</p>
      )}
    </div>
  )
}
