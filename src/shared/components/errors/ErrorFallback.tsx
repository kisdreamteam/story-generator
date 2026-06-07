import { Link } from 'react-router-dom'
import { AppButton } from '@/shared/components/AppButton'
import { ErrorState } from '@/shared/components/ErrorState'
import {
  appButtonLayoutClass,
  appButtonSecondaryClass,
  appButtonSizeMdClass,
} from '@/shared/styles/buttonClasses'

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
          className={[appButtonLayoutClass, appButtonSecondaryClass, appButtonSizeMdClass, 'w-full sm:w-auto']
            .join(' ')}
        >
          {backLabel}
        </Link>
      ) : null}
    </ErrorState>
  )
}
