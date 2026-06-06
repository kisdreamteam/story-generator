import { useToastStore } from '@/shared/stores/toastStore'
import { ToastCard } from './ToastCard'

/** Global toast stack — mount once near the app root. */
export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      aria-label="Notifications"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
      ))}
    </div>
  )
}
