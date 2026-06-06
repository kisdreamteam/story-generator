import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ninaNinoSeries } from '../../series/services/series.service'
import { buildStoryGenerationInput } from '../../story-generation/services/buildStoryGenerationInput'
import { getGenerationSubmitUi } from '../../story-generation/services/generationSubmitUi.service'
import { ninaNinoSetupDefaults } from '../config/setupDefaults'
import { getProjectById } from '../services/projects.service'
import { waitForSetupSubmitTransition } from '../services/setupSubmitTransition.service'
import { useProjectRouteState } from './useProjectRouteState'

export function useStorySetupForm() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const routeState = useProjectRouteState()

  const existingProject = projectId ? getProjectById(projectId) : undefined
  const projectTitle = routeState.title ?? existingProject?.title ?? 'Untitled Project'

  const [theme, setTheme] = useState(ninaNinoSetupDefaults.theme)
  const [setting, setSetting] = useState(ninaNinoSetupDefaults.setting)
  const [vocabularyFocus, setVocabularyFocus] = useState(ninaNinoSetupDefaults.vocabularyFocus)
  const [learningGoal, setLearningGoal] = useState(ninaNinoSetupDefaults.learningGoal)
  const [pageCount, setPageCount] = useState(ninaNinoSetupDefaults.pageCount)
  const [notes, setNotes] = useState(ninaNinoSetupDefaults.notes)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitUi = useMemo(() => getGenerationSubmitUi(), [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    const generationInput = buildStoryGenerationInput({
      projectId: projectId ?? 'unknown',
      seriesId: routeState.seriesId ?? existingProject?.seriesId ?? ninaNinoSeries.id,
      language: routeState.targetLanguage ?? existingProject?.targetLanguage,
      ageRange: routeState.ageGroup ?? existingProject?.ageGroup,
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
    theme,
    setTheme,
    setting,
    setSetting,
    vocabularyFocus,
    setVocabularyFocus,
    learningGoal,
    setLearningGoal,
    pageCount,
    setPageCount,
    notes,
    setNotes,
    isSubmitting,
    submitButtonLabel: submitUi.buttonLabel,
    submitHelperText: submitUi.helperText,
    handleSubmit,
    handleCancel,
  }
}
