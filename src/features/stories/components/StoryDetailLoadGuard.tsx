import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, AppEmptyState, AppErrorState, AppLoadingState, PageHeader } from '@/shared/components'
import type {
  StoryGeneratedLoadStatus,
  StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'

interface StoryDetailLoadGuardProps {
  status: StoryGeneratedLoadStatus
  presentation: StoryLoadErrorPresentation | null
  isAuthLoading?: boolean
  pageTitle?: string
  pageDescription?: string
  children: ReactNode
}

export function StoryDetailLoadGuard({
  status,
  presentation,
  isAuthLoading,
  pageTitle = 'Story',
  pageDescription = 'Open a saved story from Your stories.',
  children,
}: StoryDetailLoadGuardProps) {
  const navigate = useNavigate()

  function goToStories() {
    navigate('/dashboard/stories')
  }

  if (isAuthLoading || status === 'loading') {
    return (
      <>
        <PageHeader title={pageTitle} description={pageDescription} />
        <div className="mx-auto max-w-2xl">
          <AppLoadingState kind="story-detail" />
        </div>
      </>
    )
  }

  if (status === 'ready') {
    return <>{children}</>
  }

  const copy = presentation ?? {
    title: 'Story not found',
    description: 'We could not find this story. Return to Your stories and try again.',
  }

  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className="mx-auto max-w-2xl">
        {status === 'error' ? (
          <AppErrorState presentation={copy}>
            <AppButton type="button" onClick={goToStories}>
              Back to stories
            </AppButton>
          </AppErrorState>
        ) : (
          <AppEmptyState
            kind="story-not-found"
            title={copy.title}
            description={copy.description}
            actionLabel="Back to stories"
            onAction={goToStories}
          />
        )}
      </div>
    </>
  )
}
