import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus'

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const { isOffline, offlineMessage } = useConnectionStatus()

  if (!isOffline) return null

  return (
    <div
      className={`border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <p className="font-medium">Offline mode</p>
      <p className="mt-0.5 text-xs leading-relaxed text-amber-900 sm:text-sm">{offlineMessage}</p>
    </div>
  )
}
