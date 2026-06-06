import type { StorySetupInput } from '@/features/stories/types'

/** Prompt payload sent to our backend — built on the client, executed on the server. */
export interface StoryGenerationBackendPrompt {
  system: string
  user: string
}

/** Request body for POST /api/story-generation (create-flow adapter). */
export interface StoryGenerationBackendRequest {
  setup: StorySetupInput
  prompt: StoryGenerationBackendPrompt
  provider: string
  model: string
}

/** Response from our backend after it calls the AI provider with a server-side secret key. */
export interface StoryGenerationBackendResponse {
  ok: boolean
  rawText?: string
  errorMessage?: string
  provider?: string
  model?: string
}

export const STORY_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE =
  'Story generation API is not connected yet. Deploy the backend with a server-side provider key, or use mock mode.'
