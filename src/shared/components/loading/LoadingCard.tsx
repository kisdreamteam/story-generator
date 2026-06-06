import { LoadingText } from './LoadingText'
import { skeletonBlockClass } from './skeletonClasses'

export interface LoadingCardProps {
  /** List-row card (default) or compact inline panel. */
  variant?: 'default' | 'compact'
  showAction?: boolean
  showBadge?: boolean
  title?: string
  description?: string
  /** Accessible label — defaults based on variant or title. */
  ariaLabel?: string
  className?: string
}

export function LoadingCard({
  variant = 'default',
  showAction = true,
  showBadge = true,
  title,
  description,
  ariaLabel,
  className = '',
}: LoadingCardProps) {
  if (variant === 'compact') {
    return (
      <div
        className={`rounded-xl border border-stone-200 bg-white px-4 py-6 ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel ?? title ?? 'Loading'}
      >
        {title ? <p className="text-sm font-medium text-stone-900">{title}</p> : null}
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-600">{description}</p>
        ) : null}
        {!title && !description ? (
          <>
            <LoadingText width="medium" size="md" className="mb-2" />
            <LoadingText width="long" size="sm" lines={2} />
          </>
        ) : null}
        <div className={`${skeletonBlockClass} mt-4 h-2 w-full rounded-full`} />
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? 'Loading story card'}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <LoadingText width="medium" size="lg" className="min-w-[8rem] flex-1" />
            {showBadge ? (
              <div className={`${skeletonBlockClass} h-5 w-16 shrink-0 rounded-full`} />
            ) : null}
          </div>
          <LoadingText width="long" size="sm" />
          <LoadingText width="short" size="xs" />
        </div>
        {showAction ? (
          <div
            className={`${skeletonBlockClass} h-9 w-full shrink-0 rounded-lg sm:w-28`}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  )
}
