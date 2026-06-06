import { getAppSettings } from '@/features/app-settings'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ninaNinoSeries } from '../../series/services/series.service'
import { buildStoryGenerationInput } from '../../story-generation/services/buildStoryGenerationInput'
import { getGenerationSubmitUi } from '../../story-generation/services/generationSubmitUi.service'
import { ninaNinoSetupDefaults } from '../config/setupDefaults'
import { buildSetupReviewSections } from '../services/buildSetupReviewFields.service'
import { getProjectById } from '../services/projects.service'
import { waitForSetupSubmitTransition } from '../services/setupSubmitTransition.service'
import {
  hasStorySetupFormErrors,
  validateStorySetupForm,
} from '../services/validateStorySetupForm.service'
import type { SetupProgressStep, StorySetupFormErrors } from '../types/storySetupForm.types'
import { useProjectRouteState } from './useProjectRouteState'

export function useStorySetupForm() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const routeState = useProjectRouteState()

  const existingProject = projectId ? getProjectById(projectId) : undefined
  const projectTitle = routeState.title ?? existingProject?.title ?? 'Untitled Project'

  const [storyPurpose, setStoryPurpose] = useState(ninaNinoSetupDefaults.storyPurpose)
  const [storyTone, setStoryTone] = useState(ninaNinoSetupDefaults.storyTone)
  const [mainEvents, setMainEvents] = useState(ninaNinoSetupDefaults.mainEvents)
  const [wordsToInclude, setWordsToInclude] = useState(ninaNinoSetupDefaults.wordsToInclude)
  const [wordsToAvoid, setWordsToAvoid] = useState(ninaNinoSetupDefaults.wordsToAvoid)
  const [theme, setTheme] = useState(ninaNinoSetupDefaults.theme)
  const [setting, setSetting] = useState(ninaNinoSetupDefaults.setting)
  const [vocabularyFocus, setVocabularyFocus] = useState(ninaNinoSetupDefaults.vocabularyFocus)
  const [learningGoal, setLearningGoal] = useState(ninaNinoSetupDefaults.learningGoal)
  const [pageCount, setPageCount] = useState(() => getAppSettings().defaultStoryLength)
  const [notes, setNotes] = useState(ninaNinoSetupDefaults.notes)
  const [showReview, setShowReview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<StorySetupFormErrors>({})

  const submitUi = useMemo(() => getGenerationSubmitUi(), [])

  const setupProgressStep = useMemo((): SetupProgressStep => {
    if (isSubmitting) return 'generate'
    if (showReview) return 'review'
    return 'setup'
  }, [isSubmitting, showReview])

  const reviewSections = useMemo(
    () =>
      buildSetupReviewSections({
        storyPurpose,
        storyTone,
        theme,
        setting,
        vocabularyFocus,
        learningGoal,
        pageCount,
        mainEvents,
        wordsToInclude,
        wordsToAvoid,
        notes,
      }),
    [
      storyPurpose,
      storyTone,
      theme,
      setting,
      vocabularyFocus,
      learningGoal,
      pageCount,
      mainEvents,
      wordsToInclude,
      wordsToAvoid,
      notes,
    ],
  )

  function clearFieldError(field: keyof StorySetupFormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    const validationErrors = validateStorySetupForm({
      theme,
      setting,
      vocabularyFocus,
      learningGoal,
      pageCount,
      mainEvents,
    })

    if (hasStorySetupFormErrors(validationErrors)) {
      setErrors(validationErrors)
      setShowReview(false)
      return
    }

    setErrors({})
    setShowReview(true)
  }

  function handleBackToEdit() {
    setShowReview(false)
  }

  async function handleConfirmGenerate() {
    if (isSubmitting) return

    setIsSubmitting(true)

    const generationInput = buildStoryGenerationInput({
      projectId: projectId ?? 'unknown',
      seriesId: routeState.seriesId ?? existingProject?.seriesId ?? ninaNinoSeries.id,
      language: routeState.targetLanguage ?? existingProject?.targetLanguage,
      ageRange: routeState.ageGroup ?? existingProject?.ageGroup,
      storyPurpose,
      storyTone,
      mainEvents,
      wordsToInclude,
      wordsToAvoid,
      theme,
      setting,
      vocabularyFocus,
      learningGoal,
      pageCount,
      notes,
    })

    await waitForSetupSubmitTransition()

    navigate(`/projects/${projectId}/output`, {
      state: { title: projectTitle, generationInput },
    })
  }

  function handleCancel() {
    navigate('/dashboard')
  }

  return {
    projectId,
    projectTitle,
    storyPurpose,
    setStoryPurpose,
    storyTone,
    setStoryTone,
    mainEvents,
    setMainEvents: (value: string) => {
      setMainEvents(value)
      clearFieldError('mainEvents')
    },
    wordsToInclude,
    setWordsToInclude,
    wordsToAvoid,
    setWordsToAvoid,
    theme,
    setTheme: (value: string) => {
      setTheme(value)
      clearFieldError('theme')
    },
    setting,
    setSetting: (value: string) => {
      setSetting(value)
      clearFieldError('setting')
    },
    vocabularyFocus,
    setVocabularyFocus: (value: string) => {
      setVocabularyFocus(value)
      clearFieldError('vocabularyFocus')
    },
    learningGoal,
    setLearningGoal: (value: string) => {
      setLearningGoal(value)
      clearFieldError('learningGoal')
    },
    pageCount,
    setPageCount: (value: string) => {
      setPageCount(value)
      clearFieldError('pageCount')
    },
    notes,
    setNotes,
    errors,
    showReview,
    setupProgressStep,
    reviewSections,
    isSubmitting,
    submitButtonLabel: submitUi.buttonLabel,
    submitHelperText: submitUi.helperText,
    handleSubmit,
    handleBackToEdit,
    handleConfirmGenerate,
    handleCancel,
  }
}
