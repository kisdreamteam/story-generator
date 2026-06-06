import type { StoryContext } from '@/features/story-context'
import type { StoryValidationResult } from '@/features/story-validation'

/** Category of teacher-facing story guidance. */
export const TeacherGuidanceKind = {
  VOCABULARY_RECENT: 'vocabulary_recent',
  SETTING_FREQUENT: 'setting_frequent',
  THEME_RECENT: 'theme_recent',
  TARGET_WORDS: 'target_words',
  CONTINUITY: 'continuity',
} as const

export type TeacherGuidanceKind =
  (typeof TeacherGuidanceKind)[keyof typeof TeacherGuidanceKind]

export interface TeacherGuidanceSuggestion {
  id: string
  kind: TeacherGuidanceKind
  message: string
  detail?: string
}

export interface BuildTeacherGuidanceInput {
  context?: StoryContext
  validation?: StoryValidationResult
}

export interface BuildTeacherGuidanceResult {
  suggestions: TeacherGuidanceSuggestion[]
  hasSuggestions: boolean
}
