import { useEffect, useRef, useState } from 'react'
import {
  mapStorySetupInputToFormValues,
  storySetupFormDefaults,
  type StorySetupFormValues,
} from '@/features/stories'
import { classifyDraftLoad, generatedStoryFromProject } from '../lib/story-project'
import { useStoryDraft } from './useStoryDraft'
import { useStoryWorkflowActions } from './useStoryGeneratorSelectors'

export type CreateStoryStep = 'form' | 'review' | 'generated'

interface UseCreateStoryDraftLoaderOptions {
  draftId: string | null
  setStep: (step: CreateStoryStep) => void
  resetForm: (values: StorySetupFormValues) => void
  bumpFormKey: () => void
  clearDraftUiFlags: () => void
}

/** Load ?draftId= into workflow store and local form state. */
export function useCreateStoryDraftLoader({
  draftId,
  setStep,
  resetForm,
  bumpFormKey,
  clearDraftUiFlags,
}: UseCreateStoryDraftLoaderOptions) {
  const { loadDraft } = useStoryDraft()
  const {
    setSetupData,
    setGeneratedStory,
    setActiveDraftId,
    setCreatedAt,
    resetStoryWorkflow,
  } = useStoryWorkflowActions()
  const [draftLoadWarning, setDraftLoadWarning] = useState<string | null>(null)
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const loadedDraftIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!draftId) {
      loadedDraftIdRef.current = null
      setDraftLoadWarning(null)
      setIsDraftLoading(false)
      return
    }

    if (loadedDraftIdRef.current === draftId) {
      setIsDraftLoading(false)
      return
    }

    loadedDraftIdRef.current = draftId
    let cancelled = false
    setIsDraftLoading(true)
    setDraftLoadWarning(null)

    void (async () => {
      try {
        const draft = await loadDraft(draftId)
        if (cancelled) return

        const kind = classifyDraftLoad(draft)

        clearDraftUiFlags()

        if (kind === 'missing') {
          setDraftLoadWarning(
            'We could not find this story plan here. It may have been deleted or saved to your account.',
          )
          resetStoryWorkflow()
          resetForm(storySetupFormDefaults)
          bumpFormKey()
          setStep('form')
          return
        }

        setActiveDraftId(draft!.id)
        setCreatedAt(draft!.createdAt)

        if (kind === 'generated') {
          const savedStory = generatedStoryFromProject(draft!)
          setSetupData(draft!.setup ?? null)
          setGeneratedStory(savedStory)
          resetForm(
            draft!.setup ? mapStorySetupInputToFormValues(draft!.setup) : storySetupFormDefaults,
          )
          setDraftLoadWarning(null)
          bumpFormKey()
          setStep('generated')
          return
        }

        if (kind === 'no-setup') {
          setDraftLoadWarning('This story has no plan to edit. Start a new story instead.')
          resetStoryWorkflow()
          resetForm(storySetupFormDefaults)
          bumpFormKey()
          setStep('form')
          return
        }

        setSetupData(null)
        setGeneratedStory(null)
        resetForm(mapStorySetupInputToFormValues(draft!.setup!))
        setDraftLoadWarning(null)
        bumpFormKey()
        setStep('form')
      } finally {
        if (!cancelled) {
          setIsDraftLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    draftId,
    loadDraft,
    resetStoryWorkflow,
    setActiveDraftId,
    setCreatedAt,
    setGeneratedStory,
    setSetupData,
    setStep,
    resetForm,
    bumpFormKey,
    clearDraftUiFlags,
  ])

  function resetLoader() {
    loadedDraftIdRef.current = null
    setDraftLoadWarning(null)
    setIsDraftLoading(false)
  }

  return { draftLoadWarning, isDraftLoading, resetLoader }
}
