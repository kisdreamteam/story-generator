import { AppButton, ErrorState } from '@/shared/components'
import { GenerationFailureKind, type GenerationFailureKind as GenerationFailureKindValue } from '@/shared/ai/recovery'

interface StoryGenerationRecoveryProps {
  failureKind: GenerationFailureKindValue | null
  message: string
  canRetry: boolean
  hasPartialContent: boolean
  cancelled?: boolean
  isGenerating?: boolean
  isRetrying?: boolean
  onRetry?: () => void
  onEditPlan?: () => void
  onCancel?: () => void
  onDismiss?: () => void
}

function resolveRecoveryTitle(
  failureKind: GenerationFailureKindValue | null,
  hasPartialContent: boolean,
  cancelled?: boolean,
): string {
  if (cancelled || failureKind === GenerationFailureKind.CANCELLED) {
    return 'Story creation cancelled'
  }

  if (hasPartialContent) {
    return 'Story creation stopped partway through'
  }

  if (failureKind === GenerationFailureKind.TIMEOUT) {
    return 'Story creation timed out'
  }

  return 'Could not create your story'
}

export function StoryGenerationRecovery({
  failureKind,
  message,
  canRetry,
  hasPartialContent,
  cancelled = false,
  isGenerating = false,
  isRetrying = false,
  onRetry,
  onEditPlan,
  onCancel,
  onDismiss,
}: StoryGenerationRecoveryProps) {
  if (isGenerating) {
    return (
      <div className="space-y-3">
        <ErrorState
          variant="inline"
          tone="info"
          title="Creating your story"
          description="Please keep this tab open. You can cancel if you need to adjust your plan."
        />
        {onCancel ? (
          <AppButton type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel creation
          </AppButton>
        ) : null}
      </div>
    )
  }

  if (!message && !cancelled) {
    return null
  }

  const tone =
    cancelled || failureKind === GenerationFailureKind.CANCELLED
      ? 'info'
      : hasPartialContent
        ? 'warning'
        : 'error'

  return (
    <div className="space-y-3">
      <ErrorState
        variant="inline"
        tone={tone}
        title={resolveRecoveryTitle(failureKind, hasPartialContent, cancelled)}
        description={message}
      />
      <div className="flex flex-wrap gap-2">
        {canRetry && onRetry ? (
          <AppButton type="button" size="sm" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? 'Retrying…' : 'Try again'}
          </AppButton>
        ) : null}
        {onEditPlan ? (
          <AppButton type="button" variant="secondary" size="sm" onClick={onEditPlan}>
            Edit story plan
          </AppButton>
        ) : null}
        {onDismiss ? (
          <AppButton type="button" variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </AppButton>
        ) : null}
      </div>
    </div>
  )
}
