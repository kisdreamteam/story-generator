import type { StoryGenerationOutput } from './types'
import type { FallbackReason, GenerationMode } from './types/ai.types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/** Result of generateStoryOutput — output plus mode, validation, and optional AI error metadata. */
export interface StoryGenerationResult {
  output: StoryGenerationOutput
  validation: ValidationResult
  generationMode: GenerationMode
  lastAiError?: string
  fallbackReason?: FallbackReason
}
