import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  children?: ReactNode
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      )}
      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </div>
  )
}
