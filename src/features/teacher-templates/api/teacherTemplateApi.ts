import type { StorySetupFormValues } from '@/features/stories/utils/storySetupForm'
import {
  builtInTeacherTemplates,
  getBuiltInTeacherTemplate,
} from '../lib/builtInTeacherTemplates'
import {
  buildTeacherTemplate,
  formValuesToTeacherTemplatePayload,
  normalizeTeacherTemplate,
  toTeacherTemplateSummary,
  trimCustomTemplates,
} from '../lib/teacherTemplateUtils'
import type {
  TeacherTemplate,
  TeacherTemplateCategory,
  TeacherTemplateSummary,
} from '../types/teacherTemplate.types'
import { DEFAULT_TEACHER_TEMPLATE_LIMIT } from '../types/teacherTemplate.types'
import { getTeacherTemplateStore, resolveTeacherTemplateStore } from '../storage/resolveTeacherTemplateStore'

export async function listTeacherTemplates(): Promise<TeacherTemplate[]> {
  await resolveTeacherTemplateStore()
  const custom = await getTeacherTemplateStore().list()
  return [...builtInTeacherTemplates, ...trimCustomTemplates(custom)]
}

export async function listTeacherTemplateSummaries(): Promise<TeacherTemplateSummary[]> {
  const templates = await listTeacherTemplates()
  return templates.map(toTeacherTemplateSummary)
}

export async function getTeacherTemplate(id: string): Promise<TeacherTemplate | null> {
  if (!id) return null

  const builtIn = getBuiltInTeacherTemplate(id)
  if (builtIn) return builtIn

  await resolveTeacherTemplateStore()
  const loaded = await getTeacherTemplateStore().get(id)
  return normalizeTeacherTemplate(loaded)
}

export async function saveTeacherTemplate(template: TeacherTemplate): Promise<TeacherTemplate> {
  if (template.isBuiltIn) {
    throw new Error('Built-in templates cannot be saved.')
  }

  const normalized = normalizeTeacherTemplate({
    ...template,
    updatedAt: new Date().toISOString(),
  })

  if (!normalized) {
    throw new Error('Template is missing required fields.')
  }

  await resolveTeacherTemplateStore()
  const existing = await getTeacherTemplateStore().list()

  if (!existing.some((item) => item.id === normalized.id) && existing.length >= DEFAULT_TEACHER_TEMPLATE_LIMIT) {
    throw new Error(`You can save up to ${DEFAULT_TEACHER_TEMPLATE_LIMIT} custom templates.`)
  }

  await getTeacherTemplateStore().save(normalized)
  return normalized
}

export async function createTeacherTemplateFromFormValues(input: {
  name: string
  description?: string
  category?: TeacherTemplateCategory
  formValues: StorySetupFormValues
}): Promise<TeacherTemplate> {
  const payload = formValuesToTeacherTemplatePayload(input.formValues)
  const now = new Date().toISOString()

  return saveTeacherTemplate(
    buildTeacherTemplate({
      name: input.name,
      description: input.description ?? '',
      category: input.category ?? 'custom',
      ...payload,
      createdAt: now,
      updatedAt: now,
    }),
  )
}

export async function deleteTeacherTemplate(id: string): Promise<void> {
  if (!id || getBuiltInTeacherTemplate(id)) return

  await resolveTeacherTemplateStore()
  await getTeacherTemplateStore().delete(id)
}
