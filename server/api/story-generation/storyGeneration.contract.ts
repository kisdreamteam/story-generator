/**
 * Shared API contract for POST /api/story-generation.
 *
 * Keep in sync with:
 *   src/features/story-generation/types/ai.types.ts
 *   src/features/story-generation/types.ts
 *   src/features/story-generation/prompt.types.ts
 *
 * Do not import from the Vite frontend — this file is copied here so the
 * backend placeholder stays independent until a real server is wired up
 * (Vercel Functions, Netlify Functions, Express, Supabase Edge Functions, etc.).
 */

/** Mirrors StoryPromptOutput in the frontend prompt builder. */
export interface StoryPromptOutput {
  systemInstruction: string
  userInstruction: string
  outputFormatInstruction: string
  continuityInstruction: string
  safetyInstruction: string
}

/** Mirrors StoryGenerationInput — teacher setup fields sent with the prompt. */
export interface StoryGenerationInput {
  projectId: string
  seriesId: string
  language: string
  ageRange: string
  storyPurpose: string
  storyTone: string
  mainEvents: string
  wordsToInclude: string
  wordsToAvoid: string
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: number
  notes: string
  visualContinuityNotes: string[]
}

/** Payload the frontend sends to our backend (never directly to OpenAI). */
export interface AiStoryGenerationApiRequest {
  prompt: StoryPromptOutput
  input: StoryGenerationInput
  requestedModel: string
  provider: string
}

/** Response after the server calls the AI provider with a secret key. */
export interface AiStoryGenerationApiResponse {
  ok: boolean
  rawText?: string
  errorMessage?: string
  provider?: string
  model?: string
}
