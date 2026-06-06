interface LoadingStateProps {
  title?: string
  description?: string
}

export function LoadingState({
  title = 'Loading…',
  description = 'Please wait while content is prepared.',
}: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center">
      <div
        className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-brand-500"
        aria-hidden="true"
      />
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>}
      <p className="sr-only">Loading</p>
    </div>
  )
}
