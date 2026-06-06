import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader } from '@/shared/components'
import { saveStoryDraft } from '@/features/story-generator'
import { classifyStoryLoadError } from '@/features/story-generator/lib/story-route-guards'
import {
  attachGeneratedStoryToProject,
  cloneGeneratedStory,
  StoryEditForm,
  withRecalculatedWordCounts,
  type GeneratedStory,
} from '@/features/stories'
import { StoryLoadGuardView } from './story/StoryLoadGuardView'
import { useStoryGeneratedLoader } from './story/useStoryGeneratedLoader'

export function StoryEditPage() {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const { status, loaded, presentation, isAuthLoading } = useStoryGeneratedLoader(storyId)

  const [editedStory, setEditedStory] = useState<GeneratedStory | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded) {
      setEditedStory(null)
      return
    }

    setEditedStory(cloneGeneratedStory(loaded.generatedStory))
    setSaveError(null)
  }, [loaded])

  function handleCancel() {
    if (loaded) {
      navigate(`/dashboard/stories/${encodeURIComponent(loaded.draft.id)}`)
      return
    }

    navigate('/dashboard/stories')
  }

  function handleSave() {
    if (!loaded || !editedStory) return

    setIsSaving(true)
    setSaveError(null)

    void (async () => {
      try {
        const normalizedStory = withRecalculatedWordCounts(editedStory)
        const updatedProject = attachGeneratedStoryToProject(loaded.draft, normalizedStory)
        const saved = await saveStoryDraft(updatedProject)
        navigate(`/dashboard/stories/${encodeURIComponent(saved.id)}`)
      } catch (error) {
        setSaveError(classifyStoryLoadError(error).description)
      } finally {
        setIsSaving(false)
      }
    })()
  }

  return (
    <StoryLoadGuardView
      pageTitle="Edit story"
      pageDescription="Update saved story content."
      status={status}
      presentation={presentation}
      isAuthLoading={isAuthLoading}
    >
      {loaded && editedStory && (
        <>
          <PageHeader
            title={`Edit: ${loaded.draft.title}`}
            description="Make quick text changes, then save."
          />

          <div className="mx-auto max-w-2xl space-y-6">
            {saveError && (
              <ErrorState title="Could not save story" description={saveError}>
                <AppButton type="button" variant="secondary" onClick={() => setSaveError(null)}>
                  Dismiss
                </AppButton>
              </ErrorState>
            )}

            <StoryEditForm story={editedStory} onChange={setEditedStory} />

            <div className="flex flex-col gap-2 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
              <AppButton type="button" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </AppButton>
              <AppButton type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </AppButton>
            </div>
          </div>
        </>
      )}
    </StoryLoadGuardView>
  )
}
