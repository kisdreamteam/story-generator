import type { ReactNode } from 'react'

interface ErrorStateProps {
  title: string
  description?: string
  children?: ReactNode
}

export function ErrorState({ title, description, children }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-red-900">{title}</h2>
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
