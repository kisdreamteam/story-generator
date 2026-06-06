import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppEmptyState, PageHeader } from '@/shared/components'
import { StoryDetailLoadGuard } from '@/features/stories/components/StoryDetailLoadGuard'
import { useStoryDetail } from '@/features/stories/hooks/useStoryDetail'
import { storyReaderContentFromProject } from '@/features/story-reader/lib/storyReaderFromProject'
import { StoryPrintActions, StoryPrintDocument } from '../components'

export function StoryPrintPage() {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const { status, presentation, isAuthLoading, data } = useStoryDetail(storyId)

  const story = useMemo(() => {
    if (!data) {
      return null
    }

    if (data.kind === 'generated') {
      return data.generatedStory
    }

    return storyReaderContentFromProject(data.draft)
  }, [data])

  const projectTitle = data?.draft?.title ?? story?.title ?? 'Story'
  const hasDraft = Boolean(data?.draft)

  function handleBack() {
    if (storyId) {
      navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
      return
    }

    navigate('/dashboard/stories')
  }

  return (
    <StoryDetailLoadGuard status={status} presentation={presentation} isAuthLoading={isAuthLoading}>
      {story ? (
        <>
          <PageHeader
            title="Print story"
            description="Pages and vocabulary cards formatted for printing."
            actions={<StoryPrintActions onBack={handleBack} />}
          />

          <div className="mx-auto max-w-3xl px-1 sm:px-0">
            <div className="story-export-no-print mb-6 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
              Use your browser&apos;s print dialog to save as PDF later. Dedicated PDF export is not
              available yet.
            </div>

            <div id="story-print-area">
              <StoryPrintDocument story={story} projectTitle={projectTitle} />
            </div>
          </div>
        </>
      ) : hasDraft ? (
        <div className="mx-auto max-w-lg px-4 py-16">
          <AppEmptyState
            kind="story-not-generated"
            title="Generate the story first"
            description="Export is available after your story pages are generated."
            actionLabel="Back to story"
            onAction={handleBack}
          />
        </div>
      ) : null}
    </StoryDetailLoadGuard>
  )
}
