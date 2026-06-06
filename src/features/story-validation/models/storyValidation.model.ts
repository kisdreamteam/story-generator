import type { StoryContext } from '@/features/story-context'
import type { GeneratedStoryOutput } from '@/features/story-generator/lib/generation/types'

/** Non-blocking quality warning codes for generated stories. */
export const StoryValidationWarningCode = {
  REPEATED_VOCABULARY: 'repeated_vocabulary',
  REPEATED_LOCATION: 'repeated_location',
  REPEATED_THEME: 'repeated_theme',
  MISSING_TARGET_WORD: 'missing_target_word',
  MISSING_CONTINUITY_RULE: 'missing_continuity_rule',
} as const

export type StoryValidationWarningCode =
  (typeof StoryValidationWarningCode)[keyof typeof StoryValidationWarningCode]

export interface StoryValidationWarning {
  code: StoryValidationWarningCode
  message: string
  details?: Record<string, unknown>
}

export interface StoryValidationResult {
  warnings: StoryValidationWarning[]
  warningCount: number
  hasWarnings: boolean
}

export interface ValidateGeneratedStoryInput {
  story: GeneratedStoryOutput
  context: StoryContext
}
