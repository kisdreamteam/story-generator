import { AppButton } from '@/shared/components'
import { useLocalStoryMigration } from '@/features/story-generator/hooks/useLocalStoryMigration'
import { useEffect } from 'react'

interface LocalStoryMigrationPromptProps {
  /** Called after a successful or partial copy so lists can refresh. */
  onMigrationComplete?: () => void
  className?: string
}

export function LocalStoryMigrationPrompt({
  onMigrationComplete,
  className = '',
}: LocalStoryMigrationPromptProps) {
  const { uiState, pendingCount, lastResult, dismiss, migrate } = useLocalStoryMigration()

  useEffect(() => {
    if (
      (uiState === 'success' || uiState === 'partial_success') &&
      lastResult &&
      lastResult.copied > 0
    ) {
      onMigrationComplete?.()
    }
  }, [uiState, lastResult, onMigrationComplete])

  if (uiState === 'checking' || uiState === 'idle' || uiState === 'dismissed') {
    return null
  }

  const storyLabel = pendingCount === 1 ? 'story' : 'stories'

  return (
    <div
      className={`rounded-lg border border-brand-200 bg-brand-50/60 p-4 ${className}`.trim()}
      role="region"
      aria-label="Copy local stories to your account"
    >
      {uiState === 'available' && (
        <>
          <p className="text-sm font-medium text-stone-900">
            You have {pendingCount} {storyLabel} saved on this device. Copy them to your account?
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Your original stories will stay on this device.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppButton type="button" size="sm" onClick={() => void migrate()}>
              Copy to account
            </AppButton>
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss}>
              Not now
            </AppButton>
          </div>
        </>
      )}

      {uiState === 'migrating' && (
        <p className="text-sm text-stone-700" role="status">
          Copying your {storyLabel} to your account…
        </p>
      )}

      {uiState === 'success' && lastResult && (
        <>
          <p className="text-sm font-medium text-green-800" role="status">
            {lastResult.copied === 1
              ? '1 story copied to your account.'
              : `${lastResult.copied} stories copied to your account.`}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Your original stories will stay on this device.
          </p>
        </>
      )}

      {uiState === 'partial_success' && lastResult && (
        <>
          <p className="text-sm font-medium text-amber-900" role="status">
            {lastResult.copied} {lastResult.copied === 1 ? 'story' : 'stories'} copied.{' '}
            {lastResult.failed.length} could not be copied.
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-stone-600">
            {lastResult.failed.map((failure) => (
              <li key={failure.localId}>
                {failure.title}: {failure.error}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-600">
            Your original stories will stay on this device.
          </p>
          <div className="mt-3">
            <AppButton type="button" variant="secondary" size="sm" onClick={() => void migrate()}>
              Try again
            </AppButton>
          </div>
        </>
      )}

      {uiState === 'failed' && lastResult && (
        <>
          <p className="text-sm font-medium text-red-700" role="alert">
            Could not copy your stories. Please try again.
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-stone-600">
            {lastResult.failed.map((failure) => (
              <li key={failure.localId}>
                {failure.title}: {failure.error}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppButton type="button" variant="secondary" size="sm" onClick={() => void migrate()}>
              Try again
            </AppButton>
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss}>
              Not now
            </AppButton>
          </div>
        </>
      )}
    </div>
  )
}
