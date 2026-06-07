import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppEmptyState, PageHeader } from '@/shared/components'
import { dashboardNarrowEmptyShellClass, dashboardPageShellClass } from '@/shared/styles/pageShellClasses'
import { panelShellClass } from '@/shared/styles/surfaceClasses'
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

          <div className={`${dashboardPageShellClass} max-w-3xl`}>
            <div className={`story-export-no-print mb-6 p-4 text-sm text-stone-600 ${panelShellClass}`}>
              Use your browser&apos;s print dialog to save as PDF later. Dedicated PDF export is not
              available yet.
            </div>

            <div id="story-print-area">
              <StoryPrintDocument story={story} projectTitle={projectTitle} />
            </div>
          </div>
        </>
      ) : hasDraft ? (
        <div className={dashboardNarrowEmptyShellClass}>
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
