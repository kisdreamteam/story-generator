import type { ReactNode } from 'react'

interface ErrorStateProps {
  title?: string
  description?: string
  children?: ReactNode
  /** Full panel (default) or compact inline banner. */
  variant?: 'panel' | 'inline'
  /** Inline tone — error (red), warning (amber), info (sky). */
  tone?: 'error' | 'warning' | 'info'
}

const inlineToneClasses: Record<NonNullable<ErrorStateProps['tone']>, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
}

export type { ErrorStateProps }
export function ErrorState({
  title,
  description,
  children,
  variant = 'panel',
  tone = 'error',
}: ErrorStateProps) {
  const message = description ?? title ?? 'Something went wrong.'

  if (variant === 'inline') {
    return (
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${inlineToneClasses[tone]}`}
        role={tone === 'info' ? 'status' : 'alert'}
      >
        {title && description ? (
          <>
            <p className="font-medium">{title}</p>
            <p className="mt-1">{description}</p>
          </>
        ) : (
          <p>{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-red-900">{title ?? 'Something went wrong'}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-red-800">{description}</p>
      )}
      {children && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          {children}
        </div>
      )}
    </div>
  )
}
