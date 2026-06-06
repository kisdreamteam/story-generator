import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StorySetupFormValues } from '@/features/stories/utils/storySetupForm'
import {
  createTeacherTemplateFromFormValues,
  deleteTeacherTemplate,
  listTeacherTemplates,
} from '../api/teacherTemplateApi'
import { teacherTemplateToFormValues, toTeacherTemplateSummary } from '../lib/teacherTemplateUtils'
import type { TeacherTemplate, TeacherTemplateCategory, TeacherTemplateSummary } from '../types/teacherTemplate.types'

export interface UseTeacherTemplatesResult {
  templates: TeacherTemplate[]
  summaries: TeacherTemplateSummary[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  refresh: () => Promise<void>
  applyTemplate: (template: TeacherTemplate) => StorySetupFormValues
  saveTemplateFromForm: (input: {
    name: string
    description?: string
    category?: TeacherTemplateCategory
    formValues: StorySetupFormValues
  }) => Promise<TeacherTemplate | null>
  deleteTemplate: (id: string) => Promise<boolean>
}

export function useTeacherTemplates(): UseTeacherTemplatesResult {
  const [templates, setTemplates] = useState<TeacherTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const loaded = await listTeacherTemplates()
      setTemplates(loaded)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load templates.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const applyTemplate = useCallback((template: TeacherTemplate) => {
    return teacherTemplateToFormValues(template)
  }, [])

  const saveTemplateFromForm = useCallback(
    async (input: {
      name: string
      description?: string
      category?: TeacherTemplateCategory
      formValues: StorySetupFormValues
    }) => {
      setIsSaving(true)
      setError(null)

      try {
        const saved = await createTeacherTemplateFromFormValues(input)
        await refresh()
        return saved
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not save template.')
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [refresh],
  )

  const deleteTemplate = useCallback(
    async (id: string) => {
      setError(null)

      try {
        await deleteTeacherTemplate(id)
        await refresh()
        return true
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete template.')
        return false
      }
    },
    [refresh],
  )

  const summaries = useMemo(
    () => templates.map(toTeacherTemplateSummary),
    [templates],
  )

  return {
    templates,
    summaries,
    isLoading,
    isSaving,
    error,
    refresh,
    applyTemplate,
    saveTemplateFromForm,
    deleteTemplate,
  }
}

export async function prefetchTeacherTemplateSummaries(): Promise<TeacherTemplateSummary[]> {
  const templates = await listTeacherTemplates()
  return templates.map(toTeacherTemplateSummary)
}
