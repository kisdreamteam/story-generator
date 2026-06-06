import { Link } from 'react-router-dom'
import { AppButton } from '@/shared/components/AppButton'
import { ErrorState } from '@/shared/components/ErrorState'

export interface ErrorFallbackProps {
  title: string
  description: string
  onRetry: () => void
  retryLabel?: string
  /** When set, shows a navigation link as the secondary recovery action. */
  backTo?: string
  backLabel?: string
}

export function ErrorFallback({
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
  backTo,
  backLabel = 'Go back',
}: ErrorFallbackProps) {
  return (
    <ErrorState title={title} description={description}>
      <AppButton type="button" onClick={onRetry} fullWidth className="sm:w-auto">
        {retryLabel}
      </AppButton>
      {backTo ? (
        <Link
          to={backTo}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-2 sm:w-auto"
        >
          {backLabel}
        </Link>
      ) : null}
    </ErrorState>
  )
}
