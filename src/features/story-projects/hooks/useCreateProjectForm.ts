import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  defaultSeries,
  getSeriesById,
  seriesList,
} from '../../series/services/series.service'
import { DEFAULT_LANGUAGE } from '../config/formOptions'
import { generateProjectId } from '../services/projects.service'

export function useCreateProjectForm() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [seriesId, setSeriesId] = useState(defaultSeries.id)
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_LANGUAGE)
  const [ageGroup, setAgeGroup] = useState('4-6')

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
