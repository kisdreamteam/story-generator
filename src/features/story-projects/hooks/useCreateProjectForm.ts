import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppSettings } from '@/features/app-settings'
import {
  getSeriesById,
  seriesList,
} from '../../series/services/series.service'
import { generateProjectId } from '../services/projects.service'

export function useCreateProjectForm() {
  const navigate = useNavigate()
  const settings = getAppSettings()
  const [title, setTitle] = useState('')
  const [seriesId, setSeriesId] = useState(settings.defaultSeriesId)
  const [targetLanguage, setTargetLanguage] = useState(settings.defaultLanguage)
  const [ageGroup, setAgeGroup] = useState(settings.defaultAgeRange)

  const selectedSeries = getSeriesById(seriesId)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedSeries?.available) return

    const projectId = generateProjectId()
    navigate(`/projects/${projectId}/setup`, {
      state: { title: title.trim(), seriesId, targetLanguage, ageGroup },
    })
  }

  function handleCancel() {
    navigate('/dashboard')
  }

  return {
    title,
    setTitle,
    seriesId,
    setSeriesId,
    targetLanguage,
    setTargetLanguage,
    ageGroup,
    setAgeGroup,
    selectedSeries,
    seriesList,
    handleSubmit,
    handleCancel,
    canSubmit: Boolean(title.trim()),
  }
}
