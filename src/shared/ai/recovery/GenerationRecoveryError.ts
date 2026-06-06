import type {
  AIImagePromptOutput,
  AIStoryCoreOutput,
  AIStoryFlashcardOutput,
} from '../types'

export type PartialGenerationStage = 'story' | 'images'

export interface PartialAIGenerationOutput {
  story: AIStoryCoreOutput
  flashcards: AIStoryFlashcardOutput[]
  imagePrompts: AIImagePromptOutput[]
  stage: PartialGenerationStage
}

/** Error that may carry recoverable partial generation output. */
export class GenerationRecoveryError extends Error {
  readonly name = 'GenerationRecoveryError'
  readonly partialOutput: PartialAIGenerationOutput | null
  readonly stage: PartialGenerationStage | null

  constructor(
    message: string,
    options?: {
      partialOutput?: PartialAIGenerationOutput | null
      stage?: PartialGenerationStage
      cause?: unknown
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined)
    this.partialOutput = options?.partialOutput ?? null
    this.stage = options?.stage ?? options?.partialOutput?.stage ?? null
  }
}

export function isGenerationRecoveryError(error: unknown): error is GenerationRecoveryError {
  return error instanceof GenerationRecoveryError
}

export function getPartialAIGenerationOutput(error: unknown): PartialAIGenerationOutput | null {
  if (!isGenerationRecoveryError(error)) {
    return null
  }

  return error.partialOutput
}
