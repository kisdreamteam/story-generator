import type { StoryPromptOutput } from '../prompt.types'
import type { StoryGenerationInput } from '../types'

/** Payload sent from the frontend to our backend/API (not directly to OpenAI). */
export interface AiStoryGenerationApiRequest {
  prompt: StoryPromptOutput
  input: StoryGenerationInput
  requestedModel: string
  provider: string
}

/** Response from our backend/API after it calls the AI provider with a secret key. */
export interface AiStoryGenerationApiResponse {
  ok: boolean
  rawText?: string
  errorMessage?: string
  provider?: string
  model?: string
}

/** How the current story was produced — shown in UI badge and Debug tab. */
export type GenerationMode = 'mock' | 'ai' | 'fallback'

/** Developer-facing reason when generationMode is "fallback". */
export type FallbackReason =
  | 'ai-disabled'
  | 'api-not-connected'
  | 'parse-failed'
  | 'validation-failed'
  | 'unexpected-error'

export interface AiGenerationDebugStatus {
  enabled: boolean
  fixtureMode: boolean
  provider: string
  model: string
  generationMode: GenerationMode
  lastAiError?: string
  fallbackReason?: FallbackReason
}
