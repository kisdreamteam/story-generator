import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton, ErrorState, LoadingState, PageHeader } from '@/shared/components'
import { StoryEmptyState } from '@/features/stories'
import type {
  StoryGeneratedLoadStatus,
  StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'

interface StoryLoadGuardViewProps {
  pageTitle: string
  pageDescription: string
  status: StoryGeneratedLoadStatus
  presentation: StoryLoadErrorPresentation | null
  isAuthLoading?: boolean
  loadingDescription?: string
  children: ReactNode
}

export function StoryLoadGuardView({
  pageTitle,
  pageDescription,
  status,
  presentation,
  isAuthLoading,
  loadingDescription = 'Reading saved story…',
  children,
}: StoryLoadGuardViewProps) {
  const navigate = useNavigate()

  function goToStories() {
    navigate('/dashboard/stories')
  }

  if (isAuthLoading || status === 'loading') {
    return (
      <>
        <PageHeader title={pageTitle} description={pageDescription} />
        <div className="mx-auto max-w-2xl">
          <LoadingState title="Loading story…" description={loadingDescription} />
        </div>
      </>
    )
  }

  if (status === 'ready') {
    return <>{children}</>
  }

  const copy = presentation ?? {
    title: 'Story not found',
    description: 'The story could not be loaded.',
  }

  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className="mx-auto max-w-2xl">
        {status === 'error' ? (
          <ErrorState title={copy.title} description={copy.description}>
            <AppButton type="button" onClick={goToStories}>
              Back to stories
            </AppButton>
          </ErrorState>
        ) : (
          <StoryEmptyState
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
