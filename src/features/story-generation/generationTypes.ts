import type { StorySetupInput } from '@/features/stories/types'
import type { AiGenerationAdapter } from './adapters/aiGenerationAdapter.types'
import type { StoryCoreResponse } from './api/storyGenerationApi'
import type {
  GeneratedFlashcardOutput,
  GeneratedImagePromptOutput,
  GeneratedStoryCoreOutput,
  GeneratedStoryOutput,
} from '@/features/story-generator/lib/generation/types'

/** Teacher setup passed into the generation pipeline. */
export interface GenerationPipelineInput {
  setup: StorySetupInput
}

export type GenerationStage =
  | 'validate'
  | 'story'
  | 'flashcards'
  | 'imagePrompts'
  | 'combine'

export type GenerationStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface GenerationProgress {
  currentStage: GenerationStage | null
  stages: Record<GenerationStage, GenerationStageStatus>
}

export interface GenerationStageError {
  stage: GenerationStage
  code: GenerationErrorCode
  message: string
  recoverable: boolean
}

export type GenerationErrorCode =
  | 'VALIDATION_FAILED'
  | 'STORY_FAILED'
  | 'FLASHCARDS_FAILED'
  | 'IMAGE_PROMPTS_FAILED'
  | 'COMBINE_FAILED'
  | 'ABORTED'

export interface GenerationPipelinePartial {
  story: GeneratedStoryCoreOutput | null
  flashcards: GeneratedFlashcardOutput[]
  imagePrompts: GeneratedImagePromptOutput[]
}

export type GenerationPipelineStatus = 'success' | 'partial' | 'failed'

export interface GenerationPipelineResult {
  status: GenerationPipelineStatus
  output: GeneratedStoryOutput | null
  partial: GenerationPipelinePartial
  errors: GenerationStageError[]
  progress: GenerationProgress
}

export interface GenerationRecoveryCheckpoint {
  sessionId: string
  storyCore: StoryCoreResponse | null
  flashcards: GeneratedFlashcardOutput[]
  imagePrompts: GeneratedImagePromptOutput[]
  progress: GenerationProgress
  errors: GenerationStageError[]
  failedStage: GenerationStage | null
}

export type GenerationRecoveryMode = 'fresh' | 'resume' | 'retry'

export interface GenerationRecoveryOptions {
  sessionId: string
  checkpoint: GenerationRecoveryCheckpoint
  mode: GenerationRecoveryMode
  retryStage?: GenerationStage
}

export interface RunGenerateStoryPipelineOptions {
  signal?: AbortSignal
  timeoutMs?: number
  onProgress?: (progress: GenerationProgress) => void
  onCheckpoint?: (checkpoint: GenerationRecoveryCheckpoint) => void
  adapter: AiGenerationAdapter
  recovery?: GenerationRecoveryOptions
}
