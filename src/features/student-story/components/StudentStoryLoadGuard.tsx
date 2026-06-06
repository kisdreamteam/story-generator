import type { ReactNode } from 'react'
import { AppButton, EmptyState } from '@/shared/components'
import type { StoryLoadErrorPresentation } from '@/features/story-generator/lib/story-route-guards'
import type { StudentStoryLoadStatus } from '../types'

interface StudentStoryLoadGuardProps {
  status: StudentStoryLoadStatus
  presentation: StoryLoadErrorPresentation | null
  onRetry?: () => void
  children: ReactNode
}

export function StudentStoryLoadGuard({
  status,
  presentation,
  onRetry,
  children,
}: StudentStoryLoadGuardProps) {
  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 via-white to-amber-50/40 px-6">
        <p className="text-lg font-medium text-stone-700">Loading your story…</p>
      </div>
    )
  }

  if (status === 'ready') {
    return <>{children}</>
  }

  const copy = presentation ?? {
    title: 'Story not found',
    description: 'This story link is not available. Ask your teacher for a new link.',
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 via-white to-amber-50/40 px-4 py-10">
      <EmptyState
        layout="card"
        showIcon
        title={copy.title}
        description={copy.description}
        className="max-w-md"
      >
        {status === 'error' && onRetry ? (
          <AppButton type="button" variant="secondary" onClick={onRetry}>
            Try again
          </AppButton>
        ) : null}
      </EmptyState>
    </div>
  )
}
