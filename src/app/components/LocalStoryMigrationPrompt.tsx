import { AppButton, AppErrorState, AppLoadingState } from '@/shared/components'
import { useLocalStoryMigration } from '@/features/story-generator/hooks/useLocalStoryMigration'
import { formatTeacherFacingMigrationCopyFailure } from '@/features/story-generator/lib/story-route-guards'
import { storyFeedback } from '@/shared/feedback'
import { useEffect, useRef } from 'react'

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
  const feedbackKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      (uiState === 'success' || uiState === 'partial_success') &&
      lastResult &&
      lastResult.copied > 0
    ) {
      onMigrationComplete?.()
    }
  }, [uiState, lastResult, onMigrationComplete])

  useEffect(() => {
    if (!lastResult) return

    const feedbackKey = `${uiState}:${lastResult.copied}:${lastResult.failed.length}:${lastResult.skipped}`
    if (feedbackKeyRef.current === feedbackKey) return
    feedbackKeyRef.current = feedbackKey

    if (uiState === 'success' && lastResult.copied > 0) {
      storyFeedback.migrationCompleted(lastResult.copied)
      return
    }

    if (uiState === 'partial_success') {
      if (lastResult.copied > 0) {
        storyFeedback.migrationPartial(lastResult.copied, lastResult.failed.length)
      } else {
        storyFeedback.migrationFailed()
      }
      return
    }

    if (uiState === 'failed') {
      storyFeedback.migrationFailed()
    }
  }, [uiState, lastResult])

  if (uiState === 'checking' || uiState === 'idle' || uiState === 'dismissed') {
    return null
  }

  const storyLabel = pendingCount === 1 ? 'story' : 'stories'
  const isMigrating = uiState === 'migrating'

  return (
    <div
      className={`rounded-lg border border-brand-200 bg-brand-50/60 p-4 ${className}`.trim()}
      role="region"
      aria-label="Copy stories to your account"
    >
      {uiState === 'available' && (
        <>
          <p className="text-sm font-medium text-stone-900">
            You have {pendingCount} {storyLabel} on this device that are not in your account yet.
            Copy them to your teacher account?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Copies stay on this device too — nothing is removed from Your stories here.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppButton type="button" size="sm" onClick={() => void migrate()} disabled={isMigrating}>
              Copy to account
            </AppButton>
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss} disabled={isMigrating}>
              Not now
            </AppButton>
          </div>
        </>
      )}

      {uiState === 'migrating' && <AppLoadingState kind="migration" className="border-0 bg-transparent p-0" />}

      {uiState === 'success' && lastResult && (
        <>
          <p className="text-sm font-medium text-green-800" role="status">
            {lastResult.copied === 1
              ? '1 story copied to your account.'
              : `${lastResult.copied} stories copied to your account.`}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Copies stay on this device too — nothing is removed from Your stories here.
          </p>
          <div className="mt-3">
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss}>
              Dismiss
            </AppButton>
          </div>
        </>
      )}

      {uiState === 'partial_success' && lastResult && (
        <>
          <AppErrorState
            kind="migration-partial"
            copiedCount={lastResult.copied}
            failedCount={lastResult.failed.length}
            variant="inline"
          />
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-stone-600">
            {lastResult.failed.map((failure) => (
              <li key={failure.localId} className="break-words">
                <span className="font-medium text-stone-700">{failure.title}</span>
                {' — '}
                {formatTeacherFacingMigrationCopyFailure(failure.error)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">
            Copies stay on this device too — nothing is removed from Your stories here.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppButton type="button" variant="secondary" size="sm" onClick={() => void migrate()} disabled={isMigrating}>
              Try again
            </AppButton>
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss} disabled={isMigrating}>
              Dismiss
            </AppButton>
          </div>
        </>
      )}

      {uiState === 'failed' && lastResult && (
        <>
          <AppErrorState kind="migration-failed" variant="inline" />
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-stone-600">
            {lastResult.failed.map((failure) => (
              <li key={failure.localId} className="break-words">
                <span className="font-medium text-stone-700">{failure.title}</span>
                {' — '}
                {formatTeacherFacingMigrationCopyFailure(failure.error)}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppButton type="button" variant="secondary" size="sm" onClick={() => void migrate()} disabled={isMigrating}>
              Try again
            </AppButton>
            <AppButton type="button" variant="ghost" size="sm" onClick={dismiss} disabled={isMigrating}>
              Not now
            </AppButton>
          </div>
        </>
      )}
    </div>
  )
}
