import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus'

interface CloudSyncIndicatorProps {
  className?: string
}

export function CloudSyncIndicator({ className = '' }: CloudSyncIndicatorProps) {
  const { isSyncing, pendingSyncCount, syncingMessage, cloudExpected } = useConnectionStatus()

  if (!cloudExpected || !isSyncing) return null

  return (
    <div
      className={`flex items-center gap-2 border-b border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-950 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-500 motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span>{syncingMessage}</span>
      {pendingSyncCount > 0 ? (
        <span className="text-xs text-sky-800">({pendingSyncCount} queued)</span>
      ) : null}
    </div>
  )
}
