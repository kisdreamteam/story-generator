import { useEffect, useRef, useState } from 'react'
import {
  getStorySetupFormDefaults,
  mapStorySetupInputToFormValues,
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
  onPlanDraftLoaded?: () => void
  onGeneratedDraftLoaded?: () => void
}

/** Load ?draftId= into workflow store and local form state. */
export function useCreateStoryDraftLoader({
  draftId,
  setStep,
  resetForm,
  bumpFormKey,
  clearDraftUiFlags,
  onPlanDraftLoaded,
  onGeneratedDraftLoaded,
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
          resetForm(getStorySetupFormDefaults())
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
            draft!.setup ? mapStorySetupInputToFormValues(draft!.setup) : getStorySetupFormDefaults(),
          )
          setDraftLoadWarning(null)
          bumpFormKey()
          setStep('generated')
          onGeneratedDraftLoaded?.()
          return
        }

        if (kind === 'no-setup') {
          setDraftLoadWarning('This story has no plan to edit. Start a new story instead.')
          resetStoryWorkflow()
          resetForm(getStorySetupFormDefaults())
          bumpFormKey()
          setStep('form')
          return
        }

        setSetupData(draft!.setup!)
        setGeneratedStory(null)
        resetForm(mapStorySetupInputToFormValues(draft!.setup!))
        setDraftLoadWarning(null)
        bumpFormKey()
        setStep('form')
        onPlanDraftLoaded?.()
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
    onPlanDraftLoaded,
    onGeneratedDraftLoaded,
  ])

  function resetLoader() {
    loadedDraftIdRef.current = null
    setDraftLoadWarning(null)
    setIsDraftLoading(false)
  }

  return { draftLoadWarning, isDraftLoading, resetLoader }
}
