import {
  useActiveDraftId,
  useCreateStoryDraftLoader,
  useGeneratedStory,
  useGenerationActions,
  useIsGenerating,
  useSetupData,
  useStoryDraft,
  useStoryGenerationFlow,
  useStoryWorkflowActions,
  type CreateStoryStep,
} from '@/features/story-generator'
import {
  createDraftProjectFromSetup,
  mapStorySetupInputToFormValues,
  storySetupFormDefaults,
  type StorySetupFormValues,
  type StorySetupInput,
} from '@/features/stories'
import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function useCreateStoryPageState() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')

  const setupData = useSetupData()
  const generatedStory = useGeneratedStory()
  const isGenerating = useIsGenerating()
  const activeDraftId = useActiveDraftId()
  const workflow = useStoryWorkflowActions()
  const { createdAt, saveDraft } = useStoryDraft()
  const { resetGeneration } = useGenerationActions()
  const { runGeneration, saveGeneratedStory, navigateToStoryDetail, cancelGeneration } =
    useStoryGenerationFlow()

  const [step, setStep] = useState<CreateStoryStep>('form')
  const [formValues, setFormValues] = useState<StorySetupFormValues>(storySetupFormDefaults)
  const [formKey, setFormKey] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [storySaved, setStorySaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const resetForm = useCallback((values: StorySetupFormValues) => {
    setFormValues(values)
  }, [])

  const bumpFormKey = useCallback(() => {
    setFormKey((key) => key + 1)
  }, [])

  const clearDraftUiFlags = useCallback(() => {
    setDraftSaved(false)
    setStorySaved(false)
    setSaveError(null)
    cancelGeneration()
    resetGeneration()
  }, [cancelGeneration, resetGeneration])

  const { draftLoadWarning, resetLoader } = useCreateStoryDraftLoader({
    draftId,
    setStep,
    resetForm,
    bumpFormKey,
    clearDraftUiFlags,
  })

  function handleFormSubmit(data: StorySetupInput) {
    workflow.setSetupData(data)
    setFormValues(mapStorySetupInputToFormValues(data))
    setDraftSaved(false)
    setStep('review')
  }

  function handleBackToEdit() {
    if (setupData) {
      setFormValues(mapStorySetupInputToFormValues(setupData))
      bumpFormKey()
    }
    setDraftSaved(false)
    setStep('form')
  }

  function handleSaveDraft() {
    if (!setupData) return

    const draft = createDraftProjectFromSetup(setupData, {
      id: activeDraftId ?? undefined,
      createdAt: createdAt ?? undefined,
    })

    void saveDraft(draft).then(() => {
      setDraftSaved(true)
    })
  }

  function handleConfirm() {
    if (!setupData) return

    setStorySaved(false)
    setSaveError(null)
    setStep('generated')

    void (async () => {
      try {
        const output = await runGeneration(setupData)

        try {
          const saved = await saveGeneratedStory(setupData, output)
          setStorySaved(true)
          navigateToStoryDetail(saved.id)
        } catch (error) {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Your story was generated but could not be saved. Try again below.',
          )
        }
      } catch {
        // Generation errors are stored in useGenerationStore.
      }
    })()
  }

  function handleStartOver() {
    cancelGeneration()
    resetGeneration()
    workflow.resetStoryWorkflow()
    setFormValues(storySetupFormDefaults)
    bumpFormKey()
    setDraftSaved(false)
    setStorySaved(false)
    setSaveError(null)
    resetLoader()
    if (searchParams.has('draftId')) {
      setSearchParams({})
    }
    setStep('form')
  }

  function handleBackToReview() {
    cancelGeneration()
    resetGeneration()
    setSaveError(null)
    if (setupData) {
      setStep('review')
    }
  }

  function handleSaveStory() {
    if (!generatedStory || !setupData) return

    setSaveError(null)

    void (async () => {
      try {
        const saved = await saveGeneratedStory(setupData, generatedStory)
        setStorySaved(true)
        navigateToStoryDetail(saved.id)
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Could not save the generated story.',
        )
      }
    })()
  }

  function handleViewStory() {
    if (activeDraftId) {
      navigateToStoryDetail(activeDraftId)
    }
  }

  function handleEditStory() {
    if (activeDraftId) {
      navigate(`/dashboard/stories/${encodeURIComponent(activeDraftId)}/edit`)
    }
  }

  function handleExportStory() {
    console.log('Export story', generatedStory)
  }

  const showGeneratedPreview = !isGenerating && Boolean(generatedStory)

  return {
    step,
    setupData,
    generatedStory,
    formValues,
    formKey,
    draftSaved,
    draftLoadWarning,
    storySaved,
    saveError,
    isGenerating,
    showGeneratedPreview,
    handleFormSubmit,
    handleBackToEdit,
    handleSaveDraft,
    handleConfirm,
    handleStartOver,
    handleBackToReview,
    handleSaveStory,
    handleViewStory,
    handleEditStory,
    handleExportStory,
  }
}
