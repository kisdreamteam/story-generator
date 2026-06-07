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
  mapStorySetupFormToInput,
  mapStorySetupInputToFormValues,
  areStorySetupFormValuesEqual,
  areStorySetupInputsEqual,
  getStorySetupFormDefaults,
  type GeneratedStory,
  type StorySetupFormValues,
  type StorySetupInput,
} from '@/features/stories'
import {
  getCreateStoryLeaveMessage,
  shouldWarnLeaveCreateStoryFlow,
} from '@/features/stories/lib/createStoryNavigation'
import { confirmDiscardUnsavedChanges } from '@/features/stories/lib/unsavedStoryChanges'
import { formatTeacherFacingSaveError } from '@/features/story-generator/lib/story-route-guards'
import { storyFeedback } from '@/shared/feedback'
import { useAutosave } from '@/shared/hooks/useAutosave'
import type { SaveStatus } from '@/shared/lib/autosave/saveStatus'
import { useCreateStoryNavigationGuard } from '@/features/stories/hooks/useCreateStoryNavigationGuard'
import { useCreateStorySessionRecovery } from '@/features/stories/hooks/useCreateStorySessionRecovery'
import type { CreateStorySessionSnapshot } from '@/features/stories/lib/createStorySessionRecovery'
import { getTeacherTemplate, teacherTemplateToFormValues, useTeacherTemplates } from '@/features/teacher-templates'
import type { TeacherTemplateCategory } from '@/features/teacher-templates'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const { runGeneration, retryGeneration, saveGeneratedStory, navigateToStoryDetail, cancelGeneration } =
    useStoryGenerationFlow()

  const [step, setStep] = useState<CreateStoryStep>('form')
  const [formValues, setFormValues] = useState<StorySetupFormValues>(() => getStorySetupFormDefaults())
  const [formBaseline, setFormBaseline] = useState<StorySetupFormValues>(() => getStorySetupFormDefaults())
  const [liveFormValues, setLiveFormValues] = useState<StorySetupFormValues>(() => getStorySetupFormDefaults())
  const [formKey, setFormKey] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [storySaved, setStorySaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isRetryingGeneration, setIsRetryingGeneration] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const confirmInFlightRef = useRef(false)
  const lastSavedProjectIdRef = useRef<string | null>(null)

  const resetForm = useCallback((values: StorySetupFormValues) => {
    setFormValues(values)
    setFormBaseline(values)
    setLiveFormValues(values)
  }, [])

  const bumpFormKey = useCallback(() => {
    setFormKey((key) => key + 1)
  }, [])

  const clearDraftUiFlags = useCallback(() => {
    setDraftSaved(false)
    setStorySaved(false)
    setSaveError(null)
    setDraftSaveError(null)
    cancelGeneration()
    resetGeneration()
  }, [cancelGeneration, resetGeneration])

  const { draftLoadWarning, isDraftLoading, resetLoader } = useCreateStoryDraftLoader({
    draftId,
    setStep,
    resetForm,
    bumpFormKey,
    clearDraftUiFlags,
    onPlanDraftLoaded: () => setDraftSaved(true),
    onGeneratedDraftLoaded: () => setStorySaved(true),
  })

  const {
    summaries: templateSummaries,
    isLoading: templatesLoading,
    isSaving: isSavingTemplate,
    error: templateError,
    saveTemplateFromForm,
    deleteTemplate,
  } = useTeacherTemplates()

  const applySessionSnapshot = useCallback(
    (snapshot: CreateStorySessionSnapshot) => {
      workflow.setSetupData(snapshot.setupData)
      workflow.setGeneratedStory(snapshot.generatedStory)
      workflow.setActiveDraftId(snapshot.activeDraftId)
      workflow.setCreatedAt(snapshot.createdAt)
      setFormValues(snapshot.formValues)
      setFormBaseline(snapshot.formBaseline)
      setLiveFormValues(snapshot.formValues)
      setDraftSaved(snapshot.draftSaved)
      setStorySaved(snapshot.storySaved)
      setSaveError(null)
      setDraftSaveError(null)
      setStep(snapshot.step === 'review' ? 'form' : snapshot.step)
      bumpFormKey()
    },
    [workflow, bumpFormKey],
  )

  const { sessionRestored, dismissSessionRestored, clearSession } = useCreateStorySessionRecovery({
    draftId,
    isDraftLoading,
    isGenerating,
    state: {
      step,
      setupData,
      generatedStory,
      formValues: liveFormValues,
      formBaseline,
      draftSaved,
      storySaved,
      activeDraftId,
      createdAt,
    },
    onRestore: applySessionSnapshot,
  })

  useEffect(() => {
    setLiveFormValues(formValues)
  }, [formValues, formKey])

  const formSetupInput = useMemo(
    () => mapStorySetupFormToInput(liveFormValues),
    [liveFormValues],
  )

  const persistDraftPlan = useCallback(
    async (input: StorySetupInput) => {
      const draft = createDraftProjectFromSetup(input, {
        id: activeDraftId ?? undefined,
        createdAt: createdAt ?? undefined,
      })
      const saved = await saveDraft(draft)
      workflow.setSetupData(input)
      if (saved.id && searchParams.get('draftId') !== saved.id) {
        setSearchParams({ draftId: saved.id })
      }
    },
    [activeDraftId, createdAt, saveDraft, workflow, searchParams, setSearchParams],
  )

  const handleDraftPersisted = useCallback((input: StorySetupInput) => {
    const savedFormValues = mapStorySetupInputToFormValues(input)
    setDraftSaved(true)
    setDraftSaveError(null)
    setFormBaseline(savedFormValues)
    setLiveFormValues(savedFormValues)
    setFormValues(savedFormValues)
  }, [])

  const handleDraftSaveError = useCallback((error: unknown) => {
    setDraftSaveError(formatTeacherFacingSaveError(error))
  }, [])

  const cloneSetupInput = useCallback(
    (input: StorySetupInput) => JSON.parse(JSON.stringify(input)) as StorySetupInput,
    [],
  )

  const cloneGeneratedStory = useCallback(
    (story: GeneratedStory) => JSON.parse(JSON.stringify(story)) as GeneratedStory,
    [],
  )

  const isFormDraftDirty = useMemo(
    () => !areStorySetupFormValuesEqual(liveFormValues, formBaseline),
    [liveFormValues, formBaseline],
  )

  const formDraftAutosave = useAutosave({
    value: formSetupInput,
    isDirty: isFormDraftDirty,
    enabled: step === 'form' && !isDraftLoading && !isGenerating,
    resetKey: activeDraftId ?? 'new-draft',
    isEqual: areStorySetupInputsEqual,
    clone: cloneSetupInput,
    onSave: persistDraftPlan,
    onPersisted: handleDraftPersisted,
    onError: handleDraftSaveError,
  })

  const reviewDraftAutosave = useAutosave({
    value: setupData,
    isDirty: !draftSaved,
    enabled: step === 'review' && Boolean(setupData) && !isGenerating && !isConfirming,
    resetKey: activeDraftId ?? 'new-draft',
    isEqual: areStorySetupInputsEqual,
    clone: cloneSetupInput,
    onSave: persistDraftPlan,
    onPersisted: handleDraftPersisted,
    onError: handleDraftSaveError,
  })

  const persistGeneratedStoryDraft = useCallback(
    async (story: GeneratedStory) => {
      if (!setupData) return
      const saved = await saveGeneratedStory(setupData, story)
      lastSavedProjectIdRef.current = saved.id
    },
    [saveGeneratedStory, setupData],
  )

  const handleGeneratedPersisted = useCallback(() => {
    setStorySaved(true)
    setSaveError(null)
    clearSession()
  }, [clearSession])

  const generatedAutosave = useAutosave({
    value: generatedStory,
    isDirty: !storySaved,
    enabled:
      step === 'generated' &&
      Boolean(generatedStory && setupData) &&
      !storySaved &&
      !isGenerating &&
      !isConfirming &&
      !isRetryingGeneration,
    resetKey: activeDraftId ?? 'new-generated',
    isEqual: (left, right) => JSON.stringify(left) === JSON.stringify(right),
    clone: cloneGeneratedStory,
    onSave: persistGeneratedStoryDraft,
    onPersisted: handleGeneratedPersisted,
    onError: (error) => {
      setSaveError(formatTeacherFacingSaveError(error))
    },
  })

  const saveStatus: SaveStatus = useMemo(() => {
    if (step === 'generated') return generatedAutosave.status
    if (step === 'review') return reviewDraftAutosave.status
    if (step === 'form') return formDraftAutosave.status
    return 'idle'
  }, [
    step,
    formDraftAutosave.status,
    reviewDraftAutosave.status,
    generatedAutosave.status,
  ])

  const shouldWarnLeave = useMemo(
    () =>
      shouldWarnLeaveCreateStoryFlow({
        step,
        setupData,
        generatedStory,
        draftSaved,
        storySaved,
        formValues: liveFormValues,
        formBaseline,
        isGenerating,
      }),
    [step, setupData, generatedStory, draftSaved, storySaved, liveFormValues, formBaseline, isGenerating],
  )

  const leaveMessage = useMemo(
    () => getCreateStoryLeaveMessage({ generatedStory, storySaved, isGenerating }),
    [generatedStory, storySaved, isGenerating],
  )

  useCreateStoryNavigationGuard({
    shouldWarn: shouldWarnLeave,
    message: leaveMessage,
  })

  const handleFormValuesChange = useCallback((values: StorySetupFormValues) => {
    setLiveFormValues(values)
  }, [])

  const handleApplyTemplate = useCallback(
    async (templateId: string) => {
      const template = await getTeacherTemplate(templateId)
      if (!template) return

      const appliedValues = teacherTemplateToFormValues(template)
      resetForm(appliedValues)
      bumpFormKey()
      setSelectedTemplateId(templateId)
      setDraftSaved(false)
      setDraftSaveError(null)
      storyFeedback.templateApplied(template.name)
    },
    [bumpFormKey, resetForm],
  )

  const handleSaveTemplate = useCallback(
    async (input: {
      name: string
      description: string
      category: TeacherTemplateCategory
      formValues: StorySetupFormValues
    }) => {
      const saved = await saveTemplateFromForm(input)
      if (saved) {
        setSelectedTemplateId(saved.id)
        storyFeedback.templateSaved(saved.name)
      }
    },
    [saveTemplateFromForm],
  )

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      const template = templateSummaries.find((item) => item.id === templateId)
      const deleted = await deleteTemplate(templateId)
      if (deleted) {
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId(null)
        }
        storyFeedback.templateDeleted(template?.name)
      }
    },
    [deleteTemplate, selectedTemplateId, templateSummaries],
  )

  function triggerGeneration(data: StorySetupInput) {
    if (isGenerating || isConfirming || confirmInFlightRef.current) return

    confirmInFlightRef.current = true
    setIsConfirming(true)
    setStorySaved(false)
    setSaveError(null)
    setStep('generated')

    void (async () => {
      try {
        const output = await runGeneration(data)

        try {
          const saved = await saveGeneratedStory(data, output)
          clearSession()
          setStorySaved(true)
          storyFeedback.storySaved()
          navigateToStoryDetail(saved.id)
        } catch (error) {
          const message = formatTeacherFacingSaveError(error)
          setSaveError(message)
          storyFeedback.storyGenerated()
          storyFeedback.cloudSyncFailed(message)
        }
      } catch {
        // Generation errors are stored in useGenerationStore.
      } finally {
        confirmInFlightRef.current = false
        setIsConfirming(false)
      }
    })()
  }

  function handleFormSubmit(data: StorySetupInput) {
    workflow.setSetupData(data)
    setFormValues(mapStorySetupInputToFormValues(data))
    setDraftSaved(false)
    setDraftSaveError(null)
    triggerGeneration(data)
  }

  function handleSavePlan() {
    if (isGenerating || isConfirming || formDraftAutosave.isSaving) return

    const input = mapStorySetupFormToInput(liveFormValues)
    workflow.setSetupData(input)

    void (async () => {
      const saved = await formDraftAutosave.flushSave()
      if (saved) {
        storyFeedback.planSaved()
      }
    })()
  }

  function handleBackToEdit() {
    if (setupData) {
      const values = mapStorySetupInputToFormValues(setupData)
      setFormValues(values)
      setLiveFormValues(values)
      bumpFormKey()
    }
    setDraftSaveError(null)
    setStep('form')
  }

  function handleSaveDraft() {
    if (isGenerating || isConfirming) return

    void (async () => {
      const flush =
        step === 'form' ? formDraftAutosave.flushSave : reviewDraftAutosave.flushSave
      const saved = await flush()
      if (saved) {
        storyFeedback.planSaved()
      }
    })()
  }

  function handleConfirm() {
    if (!setupData) return
    triggerGeneration(setupData)
  }

  function handleCancelGeneration() {
    cancelGeneration()
  }

  function handleDismissRecovery() {
    resetGeneration()
  }

  function handleRetryGeneration() {
    if (!setupData || isGenerating || isRetryingGeneration) return

    setIsRetryingGeneration(true)
    setSaveError(null)

    void (async () => {
      try {
        const output = await retryGeneration(setupData)

        try {
          const saved = await saveGeneratedStory(setupData, output)
          clearSession()
          setStorySaved(true)
          storyFeedback.storySaved()
          navigateToStoryDetail(saved.id)
        } catch (error) {
          const message = formatTeacherFacingSaveError(error)
          setSaveError(message)
          storyFeedback.storyGenerated()
          storyFeedback.cloudSyncFailed(message)
        }
      } catch {
        // Recovery state is stored in useGenerationStore.
      } finally {
        setIsRetryingGeneration(false)
      }
    })()
  }

  function handleStartOver() {
    if (shouldWarnLeave && !confirmDiscardUnsavedChanges(leaveMessage)) {
      return
    }

    clearSession()
    cancelGeneration()
    resetGeneration()
    workflow.resetStoryWorkflow()
    resetForm(getStorySetupFormDefaults())
    bumpFormKey()
    setDraftSaved(false)
    setStorySaved(false)
    setSaveError(null)
    setDraftSaveError(null)
    resetLoader()
    setSelectedTemplateId(null)
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
      const values = mapStorySetupInputToFormValues(setupData)
      setFormValues(values)
      setLiveFormValues(values)
      bumpFormKey()
    }
    setStep('form')
  }

  function handleSaveStory() {
    if (!generatedStory || !setupData || generatedAutosave.isSaving) return

    setSaveError(null)

    void (async () => {
      const saved = await generatedAutosave.flushSave()
      if (!saved) return

      const targetId = lastSavedProjectIdRef.current ?? activeDraftId
      storyFeedback.storySaved()
      if (targetId) {
        navigateToStoryDetail(targetId)
      }
    })()
  }

  function handleViewStory() {
    const targetId = activeDraftId ?? lastSavedProjectIdRef.current
    if (targetId) {
      navigateToStoryDetail(targetId)
    }
  }

  function handleEditStory() {
    const targetId = activeDraftId ?? lastSavedProjectIdRef.current
    if (targetId) {
      navigate(`/dashboard/stories/${encodeURIComponent(targetId)}/edit`)
    }
  }

  const showGeneratedPreview = !isGenerating && Boolean(generatedStory)

  return {
    step,
    setupData,
    generatedStory,
    formValues,
    liveFormValues,
    formKey,
    draftSaved,
    draftLoadWarning,
    draftSaveError,
    isDraftLoading,
    sessionRestored,
    saveStatus,
    dismissSessionRestored,
    isSavingDraft: formDraftAutosave.isSaving || reviewDraftAutosave.isSaving,
    isSavingStory: generatedAutosave.isSaving,
    isConfirming: isConfirming || isGenerating,
    isRetryingGeneration,
    storySaved,
    saveError,
    isGenerating,
    showGeneratedPreview,
    handleFormValuesChange,
    handleFormSubmit,
    handleSavePlan,
    isSavingPlan: formDraftAutosave.isSaving,
    handleApplyTemplate,
    handleSaveTemplate,
    handleDeleteTemplate,
    templateSummaries,
    templatesLoading,
    isSavingTemplate,
    templateError,
    selectedTemplateId,
    handleBackToEdit,
    handleSaveDraft,
    handleConfirm,
    handleStartOver,
    handleBackToReview,
    handleRetryGeneration,
    handleCancelGeneration,
    handleDismissRecovery,
    handleSaveStory,
    handleViewStory,
    handleEditStory,
  }
}
