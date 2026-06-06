import { useEffect } from 'react'
import type { ToastItem, ToastTone } from './types'

const toneStyles: Record<
  ToastTone,
  { container: string; title: string; description: string; icon: string }
> = {
  success: {
    container: 'border-green-200 bg-white shadow-lg shadow-green-900/5',
    title: 'text-green-950',
    description: 'text-green-800',
    icon: 'bg-green-100 text-green-700',
  },
  error: {
    container: 'border-red-200 bg-white shadow-lg shadow-red-900/5',
    title: 'text-red-950',
    description: 'text-red-800',
    icon: 'bg-red-100 text-red-700',
  },
  warning: {
    container: 'border-amber-200 bg-white shadow-lg shadow-amber-900/5',
    title: 'text-amber-950',
    description: 'text-amber-900',
    icon: 'bg-amber-100 text-amber-800',
  },
  info: {
    container: 'border-sky-200 bg-white shadow-lg shadow-sky-900/5',
    title: 'text-sky-950',
    description: 'text-sky-800',
    icon: 'bg-sky-100 text-sky-700',
  },
}

const toneLabels: Record<ToastTone, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  const symbol =
    tone === 'success' ? '✓' : tone === 'error' ? '!' : tone === 'warning' ? '!' : 'i'

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${toneStyles[tone].icon}`}
      aria-hidden="true"
    >
      {symbol}
    </span>
  )
}

export interface ToastCardProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const styles = toneStyles[toast.tone]

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => window.clearTimeout(timer)
  }, [toast.duration, toast.id, onDismiss])

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border p-4 ${styles.container}`}
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
    >
      <ToastIcon tone={toast.tone} />
      <div className="min-w-0 flex-1 text-left">
        <p className={`text-sm font-semibold ${styles.title}`}>{toast.title}</p>
        {toast.description ? (
          <p className={`mt-1 text-sm leading-relaxed ${styles.description}`}>{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md px-1 text-stone-400 transition-colors hover:text-stone-700"
        aria-label={`Dismiss ${toneLabels[toast.tone].toLowerCase()} notification`}
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  )
}
