import type { ReactNode } from 'react'

export type AppBadgeTone = 'neutral' | 'muted' | 'brand' | 'brandStrong' | 'warning' | 'outline'

interface AppBadgeProps {
  children: ReactNode
  tone?: AppBadgeTone
  className?: string
}

const toneClasses: Record<AppBadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-700',
  muted: 'bg-stone-100 text-stone-600',
  brand: 'bg-brand-50 text-brand-700',
  brandStrong: 'bg-brand-50 font-semibold text-brand-800',
  warning: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  outline: 'bg-white text-stone-700 ring-1 ring-stone-200',
}

/** Lightweight meta pill for counts, labels, and non-lifecycle status copy. */
export function AppBadge({ children, tone = 'neutral', className = '' }: AppBadgeProps) {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium sm:text-sm',
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
