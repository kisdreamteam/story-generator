import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus'

interface CloudUnavailableNoticeProps {
  className?: string
}

export function CloudUnavailableNotice({ className = '' }: CloudUnavailableNoticeProps) {
  const { cloudUnavailable, cloudUnavailableMessage, isSyncing } = useConnectionStatus()

  if (!cloudUnavailable || isSyncing) return null

  return (
    <div
      className={`border-b border-stone-200 bg-stone-100 px-4 py-2.5 text-center text-sm text-stone-800 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <p className="font-medium">Account sync paused</p>
      <p className="mt-0.5 text-xs leading-relaxed text-stone-700 sm:text-sm">
        {cloudUnavailableMessage}
      </p>
    </div>
  )
}
