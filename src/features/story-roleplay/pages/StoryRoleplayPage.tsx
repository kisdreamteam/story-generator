import { useNavigate, useParams } from 'react-router-dom'
import { AppEmptyState, PageHeader } from '@/shared/components'
import { dashboardNarrowEmptyShellClass, dashboardPageShellClass } from '@/shared/styles/pageShellClasses'
import { StoryDetailLoadGuard } from '@/features/stories/components/StoryDetailLoadGuard'
import { useStoryReaderRoute } from '@/features/story-reader/hooks'
import { RoleplayReader, RoleplayScriptDocument, RoleplayScriptPrintActions } from '../components'
import { useRoleplayScript } from '../hooks'

export function StoryRoleplayPage() {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const { status, presentation, isAuthLoading, story, hasDraft } = useStoryReaderRoute(storyId)
  const script = useRoleplayScript(story)

  function handleBack() {
    if (storyId) {
      navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
      return
    }

    navigate('/dashboard/stories')
  }

  return (
    <StoryDetailLoadGuard status={status} presentation={presentation} isAuthLoading={isAuthLoading}>
      {story && script ? (
        <>
          <PageHeader
            title="Roleplay script"
            description="Read line by line with your class or open the full script."
            actions={
              <RoleplayScriptPrintActions onBack={handleBack} />
            }
          />

          <div className={`${dashboardPageShellClass} max-w-4xl`}>
            <RoleplayReader script={script} />

            <div id="roleplay-print-area" className="sr-only print:not-sr-only print:mt-0">
              <RoleplayScriptDocument script={script} />
            </div>
          </div>
        </>
      ) : hasDraft ? (
        <div className={dashboardNarrowEmptyShellClass}>
          <AppEmptyState
            kind="story-not-generated"
            title="Generate the story first"
            description="Roleplay scripts are created from finished story pages. Generate your story, then return here."
            actionLabel="Back to story"
            onAction={handleBack}
          />
        </div>
      ) : null}
    </StoryDetailLoadGuard>
  )
}
