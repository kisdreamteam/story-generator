import { useStorageStatus } from '@/features/story-generator/hooks/useStorageStatus'
import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus'

const badgeStyles: Record<string, string> = {
  'cloud-active': 'bg-brand-50 text-brand-800 ring-brand-200',
  'cloud-paused': 'bg-stone-100 text-stone-800 ring-stone-300',
  'not-signed-in': 'bg-amber-50 text-amber-900 ring-amber-200',
  'feature-flag-disabled': 'bg-stone-100 text-stone-700 ring-stone-200',
  'missing-configuration': 'bg-stone-100 text-stone-700 ring-stone-200',
  'local-default': 'bg-stone-100 text-stone-700 ring-stone-200',
  checking: 'bg-stone-100 text-stone-600 ring-stone-200',
  offline: 'bg-amber-50 text-amber-900 ring-amber-200',
}

interface StorageStatusIndicatorProps {
  /** Hide helper sentence; show badge only (e.g. header). */
  compact?: boolean
  className?: string
}

export function StorageStatusIndicator({ compact, className = '' }: StorageStatusIndicatorProps) {
  const status = useStorageStatus()
  const connection = useConnectionStatus()

  const reasonKey = connection.isOffline
    ? 'offline'
    : connection.cloudUnavailable
      ? 'cloud-paused'
      : status.reason

  const style = badgeStyles[reasonKey] ?? badgeStyles['local-default']

  const badgeLabel = connection.isOffline
    ? 'Offline — saved here'
    : connection.cloudUnavailable
      ? 'Saved here — sync paused'
      : connection.isSyncing && status.adapter === 'supabase'
        ? 'Syncing…'
        : status.badgeLabel

  const message = connection.isOffline
    ? connection.offlineMessage
    : connection.cloudUnavailable
      ? connection.cloudUnavailableMessage
      : connection.isSyncing && status.adapter === 'supabase'
        ? connection.syncingMessage
        : status.message

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()} role="status" aria-live="polite">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            connection.isOffline || connection.cloudUnavailable
              ? 'bg-amber-500'
              : status.adapter === 'supabase'
                ? connection.isSyncing
                  ? 'animate-pulse bg-sky-500 motion-reduce:animate-none'
                  : 'bg-brand-500'
                : 'bg-stone-400'
          }`}
          aria-hidden="true"
        />
        {badgeLabel}
      </span>
      {!compact && (
        <p className="text-sm text-stone-600">{message}</p>
      )}
    </div>
  )
}
