import type { ReactNode } from 'react'
import { dashedPanelShellClass } from '@/shared/styles/surfaceClasses'
import { AppButton } from './AppButton'
import { AppCard } from './AppCard'

export interface EmptyStateProps {
  title: string
  description?: string
  /** Short tips shown as a bullet list. */
  hints?: string[]
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
  /** Page panel (default), story card, or compact section placeholder. */
  layout?: 'page' | 'card' | 'section'
  showIcon?: boolean
  className?: string
}

function EmptyStateIcon() {
  return (
    <div
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500"
      aria-hidden="true"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </div>
  )
}

function EmptyStateContent({
  title,
  description,
  hints,
  actionLabel,
  onAction,
  children,
  showIcon,
  titleClassName = 'text-lg',
}: {
  title: string
  description?: string
  hints?: string[]
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
  showIcon?: boolean
  titleClassName?: string
}) {
  const showAction = Boolean(actionLabel && onAction)

  return (
    <div className="mx-auto max-w-md space-y-4">
      {showIcon ? <EmptyStateIcon /> : null}
      <div className="space-y-2">
        <h2 className={`font-semibold text-stone-900 ${titleClassName}`}>{title}</h2>
        {description && <p className="text-sm leading-relaxed text-stone-600">{description}</p>}
      </div>
      {hints && hints.length > 0 && (
        <ul className="space-y-1.5 text-left text-sm text-stone-600">
          {hints.map((hint) => (
            <li key={hint} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      )}
      {children && <div className="flex justify-center pt-1">{children}</div>}
      {showAction && (
        <div className="pt-1">
          <AppButton type="button" onClick={onAction}>
            {actionLabel}
          </AppButton>
        </div>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  hints,
  actionLabel,
  onAction,
  children,
  layout = 'page',
  showIcon = false,
  className = '',
}: EmptyStateProps) {
  if (layout === 'section') {
    return (
      <AppCard padding="md" className={`border-dashed border-stone-200 bg-stone-50/60 text-center ${className}`.trim()}>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
          {description && <p className="text-sm leading-relaxed text-stone-600">{description}</p>}
        </div>
      </AppCard>
    )
  }

  if (layout === 'card') {
    return (
      <AppCard
        padding="lg"
        className={`border-dashed bg-stone-50/50 text-center ${className}`.trim()}
      >
        <EmptyStateContent
          title={title}
          description={description}
          hints={hints}
          actionLabel={actionLabel}
          onAction={onAction}
          children={children}
          showIcon={showIcon}
          titleClassName="text-base"
        />
      </AppCard>
    )
  }

  return (
    <div
      className={`${dashedPanelShellClass} bg-white px-6 py-12 text-center ${className}`.trim()}
    >
      <EmptyStateContent
        title={title}
        description={description}
        hints={hints}
        actionLabel={actionLabel}
        onAction={onAction}
        children={children}
        showIcon={showIcon}
      />
    </div>
  )
}
