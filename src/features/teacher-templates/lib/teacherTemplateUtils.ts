import type { StorySetupInput } from '@/features/stories/types'
import { mapStorySetupFormToInput, mapStorySetupInputToFormValues } from '@/features/stories/utils/storySetupForm'
import type { StorySetupFormValues } from '@/features/stories/utils/storySetupForm'
import type {
  TeacherTemplate,
  TeacherTemplateCategory,
  TeacherTemplatePreferences,
  TeacherTemplateSetupFields,
  TeacherTemplateSummary,
  TeacherTemplateVocabularyTargets,
} from '../types/teacherTemplate.types'
import { DEFAULT_TEACHER_TEMPLATE_LIMIT } from '../types/teacherTemplate.types'
import { formatTeacherTemplateTimestamp } from './teacherTemplateFormat'

export function createTeacherTemplateId(): string {
  return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function teacherTemplateToStorySetupInput(template: TeacherTemplate): StorySetupInput {
  return {
    storyPurpose: template.preferences.storyPurpose,
    storyTone: template.preferences.storyTone,
    theme: template.setupFields.theme,
    setting: template.setupFields.setting,
    vocabularyFocus: template.vocabularyTargets.vocabularyFocus,
    lessonGoal: template.vocabularyTargets.lessonGoal,
    mainEvents: template.setupFields.mainEvents,
    wordsToInclude: template.vocabularyTargets.wordsToInclude,
    wordsToAvoid: template.vocabularyTargets.wordsToAvoid,
    pageCount: template.preferences.pageCount,
    notes: template.setupFields.notes,
    ageRange: template.preferences.ageRange,
    language: template.preferences.language,
    characters: template.setupFields.characters,
  }
}

export function teacherTemplateToFormValues(template: TeacherTemplate): StorySetupFormValues {
  return mapStorySetupInputToFormValues(teacherTemplateToStorySetupInput(template))
}

export function storySetupInputToTeacherTemplatePayload(
  input: StorySetupInput,
): Pick<TeacherTemplate, 'preferences' | 'vocabularyTargets' | 'setupFields'> {
  return {
    preferences: {
      storyPurpose: input.storyPurpose,
      storyTone: input.storyTone,
      ageRange: input.ageRange,
      language: input.language,
      pageCount: input.pageCount,
    },
    vocabularyTargets: {
      lessonGoal: input.lessonGoal,
      vocabularyFocus: input.vocabularyFocus,
      wordsToInclude: input.wordsToInclude,
      wordsToAvoid: input.wordsToAvoid,
    },
    setupFields: {
      theme: input.theme,
      setting: input.setting,
      mainEvents: input.mainEvents,
      characters: input.characters,
      notes: input.notes,
    },
  }
}

export function formValuesToTeacherTemplatePayload(
  values: StorySetupFormValues,
): Pick<TeacherTemplate, 'preferences' | 'vocabularyTargets' | 'setupFields'> {
  return storySetupInputToTeacherTemplatePayload(mapStorySetupFormToInput(values))
}

export function toTeacherTemplateSummary(template: TeacherTemplate): TeacherTemplateSummary {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    isBuiltIn: Boolean(template.isBuiltIn),
    updatedAt: template.updatedAt,
    formattedUpdatedAt: formatTeacherTemplateTimestamp(template.updatedAt),
  }
}

export function normalizeTeacherTemplate(value: TeacherTemplate | null | undefined): TeacherTemplate | null {
  if (!value?.id || !value.name) return null

  return {
    id: value.id,
    name: value.name.trim(),
    description: value.description?.trim() ?? '',
    category: value.category ?? 'custom',
    preferences: normalizePreferences(value.preferences),
    vocabularyTargets: normalizeVocabularyTargets(value.vocabularyTargets),
    setupFields: normalizeSetupFields(value.setupFields),
    isBuiltIn: Boolean(value.isBuiltIn),
    createdAt: value.createdAt ?? new Date().toISOString(),
    updatedAt: value.updatedAt ?? value.createdAt ?? new Date().toISOString(),
  }
}

function normalizePreferences(
  value: TeacherTemplatePreferences | null | undefined,
): TeacherTemplatePreferences {
  return {
    storyPurpose: value?.storyPurpose?.trim() ?? 'Introduce vocabulary',
    storyTone: value?.storyTone?.trim() ?? 'Warm',
    ageRange: value?.ageRange?.trim() ?? '4-6',
    language: value?.language?.trim() ?? 'English',
    pageCount: Number.isFinite(value?.pageCount) ? Number(value?.pageCount) : 12,
  }
}

function normalizeVocabularyTargets(
  value: TeacherTemplateVocabularyTargets | null | undefined,
): TeacherTemplateVocabularyTargets {
  return {
    lessonGoal: value?.lessonGoal?.trim() ?? '',
    vocabularyFocus: value?.vocabularyFocus?.trim() ?? '',
    wordsToInclude: value?.wordsToInclude?.trim() ?? '',
    wordsToAvoid: value?.wordsToAvoid?.trim() ?? '',
  }
}

function normalizeSetupFields(
  value: TeacherTemplateSetupFields | null | undefined,
): TeacherTemplateSetupFields {
  return {
    theme: value?.theme?.trim() ?? '',
    setting: value?.setting?.trim() ?? '',
    mainEvents: value?.mainEvents?.trim() ?? '',
    characters: value?.characters?.trim() ?? '',
    notes: value?.notes?.trim() ?? '',
  }
}

export function buildTeacherTemplate(input: {
  name: string
  description?: string
  category: TeacherTemplateCategory
  preferences: TeacherTemplatePreferences
  vocabularyTargets: TeacherTemplateVocabularyTargets
  setupFields: TeacherTemplateSetupFields
  id?: string
  isBuiltIn?: boolean
  createdAt?: string
  updatedAt?: string
}): TeacherTemplate {
  const now = new Date().toISOString()

  return normalizeTeacherTemplate({
    id: input.id ?? createTeacherTemplateId(),
    name: input.name,
    description: input.description ?? '',
    category: input.category,
    preferences: input.preferences,
    vocabularyTargets: input.vocabularyTargets,
    setupFields: input.setupFields,
    isBuiltIn: input.isBuiltIn,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  })!
}

export function trimCustomTemplates(
  templates: TeacherTemplate[],
  limit = DEFAULT_TEACHER_TEMPLATE_LIMIT,
): TeacherTemplate[] {
  const custom = templates
    .filter((template) => !template.isBuiltIn)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  return custom.slice(0, limit)
}

export function getTeacherTemplateCategoryLabel(category: TeacherTemplateCategory): string {
  switch (category) {
    case 'field-trip':
      return 'Field trip'
    case 'phonics':
      return 'Phonics'
    case 'roleplay':
      return 'Roleplay'
    case 'sel':
      return 'SEL'
    default:
      return 'Custom'
  }
}

export { DEFAULT_TEACHER_TEMPLATE_LIMIT }
