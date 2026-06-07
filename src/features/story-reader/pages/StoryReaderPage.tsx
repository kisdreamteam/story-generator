import { useNavigate, useParams } from 'react-router-dom'
import { AppEmptyState } from '@/shared/components'
import { dashboardNarrowEmptyShellClass } from '@/shared/styles/pageShellClasses'
import type { GeneratedStory } from '@/features/stories/types'
import { StoryDetailLoadGuard } from '@/features/stories/components/StoryDetailLoadGuard'
import { StoryReader } from '../components'
import { useStoryReaderRoute } from '../hooks'

export interface StoryReaderPageProps {
  /** Pass a story directly for embedded or classroom use — no route loading required. */
  story?: GeneratedStory
  onExit?: () => void
}

/**
 * Route page for `/dashboard/stories/:storyId/read`.
 * Loads the saved draft by id, converts it to reader format, and opens StoryReader.
 */
export function StoryReaderPage({ story: storyProp, onExit }: StoryReaderPageProps = {}) {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const { status, presentation, isAuthLoading, story, hasDraft } = useStoryReaderRoute(
    storyProp ? undefined : storyId,
  )

  const handleExit =
    onExit ??
    (() => {
      if (storyId) {
        navigate(`/dashboard/stories/${storyId}`)
        return
      }

      navigate('/dashboard/stories')
    })

  if (storyProp) {
    return <StoryReader story={storyProp} onExit={handleExit} />
  }

  return (
    <StoryDetailLoadGuard status={status} presentation={presentation} isAuthLoading={isAuthLoading}>
      {story ? (
        <StoryReader story={story} onExit={handleExit} />
      ) : hasDraft ? (
        <div className={dashboardNarrowEmptyShellClass}>
          <AppEmptyState
            kind="story-not-generated"
            title="This story is not ready to read"
            description="Generate story content first, then open the reader from your saved library."
            actionLabel="Back to story"
            onAction={() => navigate(`/dashboard/stories/${storyId}`)}
          />
        </div>
      ) : null}
    </StoryDetailLoadGuard>
  )
}
