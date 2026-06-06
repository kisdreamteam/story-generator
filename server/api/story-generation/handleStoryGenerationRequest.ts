/**
 * Shared API contract for POST /api/story-generation.
 *
 * Keep in sync with:
 *   src/features/story-generation/api/storyGenerationBackend.types.ts
 *
 * Do not import from the Vite frontend bundle — copy or share this file with your
 * server handler (Vercel, Netlify, Express, Supabase Edge Functions, etc.).
 */

/** Mirrors StoryGenerationBackendPrompt in the frontend. */
export interface StoryGenerationBackendPrompt {
  system: string
  user: string
}

/** Create-flow request — teacher setup + built prompt, no secret keys. */
export interface StoryGenerationBackendRequest {
  setup: Record<string, unknown>
  prompt: StoryGenerationBackendPrompt
  provider: string
  model: string
}

/** Response after the server calls the AI provider with a secret key. */
export interface StoryGenerationBackendResponse {
  ok: boolean
  rawText?: string
  errorMessage?: string
  provider?: string
  model?: string
}

/** Legacy Phase 2B prompt sections — kept for older clients. */
export interface StoryPromptOutput {
  systemInstruction: string
  userInstruction: string
  outputFormatInstruction: string
  continuityInstruction: string
  safetyInstruction: string
}

/** Legacy Phase 2B generation input — kept for older clients. */
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

/** Legacy Phase 2B request shape. */
export interface AiStoryGenerationApiRequest {
  prompt: StoryPromptOutput
  input: StoryGenerationInput
  requestedModel: string
  provider: string
}

/** Legacy Phase 2B response shape. */
export interface AiStoryGenerationApiResponse {
  ok: boolean
  rawText?: string
  errorMessage?: string
  provider?: string
  model?: string
}

export const STORY_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE =
  'Story generation API is not connected yet. Deploy the backend with a server-side provider key, or use mock mode.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Validate the create-flow backend request body. */
export function validateStoryGenerationBackendRequest(
  value: unknown,
): value is StoryGenerationBackendRequest {
  if (!isRecord(value)) {
    return false
  }

  if (!isRecord(value.setup) || !isRecord(value.prompt)) {
    return false
  }

  const setup = value.setup
  const prompt = value.prompt

  return (
    readTrimmedString(setup.lessonGoal) !== null &&
    readTrimmedString(setup.theme) !== null &&
    readTrimmedString(setup.setting) !== null &&
    typeof setup.pageCount === 'number' &&
    setup.pageCount >= 1 &&
    readTrimmedString(prompt.system) !== null &&
    readTrimmedString(prompt.user) !== null &&
    readTrimmedString(value.provider) !== null &&
    readTrimmedString(value.model) !== null
  )
}

interface OpenAiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
  }
}

async function callOpenAiStoryGeneration(
  request: StoryGenerationBackendRequest,
  apiKey: string,
): Promise<StoryGenerationBackendResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: 'system', content: request.prompt.system },
        { role: 'user', content: request.prompt.user },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  let payload: OpenAiChatCompletionResponse

  try {
    payload = (await response.json()) as OpenAiChatCompletionResponse
  } catch {
    return {
      ok: false,
      errorMessage: `OpenAI returned a non-JSON response (${response.status}).`,
      provider: request.provider,
      model: request.model,
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      errorMessage:
        payload.error?.message ??
        `OpenAI request failed with status ${response.status}.`,
      provider: request.provider,
      model: request.model,
    }
  }

  const rawText = payload.choices?.[0]?.message?.content?.trim()

  if (!rawText) {
    return {
      ok: false,
      errorMessage: 'OpenAI returned an empty story response.',
      provider: request.provider,
      model: request.model,
    }
  }

  return {
    ok: true,
    rawText,
    provider: request.provider,
    model: request.model,
  }
}

/**
 * Server-side story generation handler.
 * Reads OPENAI_API_KEY from process.env — never from VITE_* variables.
 */
export async function handleStoryGenerationRequest(
  body: unknown,
): Promise<StoryGenerationBackendResponse> {
  if (!validateStoryGenerationBackendRequest(body)) {
    return {
      ok: false,
      errorMessage: 'Invalid story generation request payload.',
    }
  }

  const request = body
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    return {
      ok: false,
      errorMessage: STORY_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE,
      provider: request.provider,
      model: request.model,
    }
  }

  if (request.provider !== 'openai') {
    return {
      ok: false,
      errorMessage: `Provider "${request.provider}" is not supported by the backend placeholder yet.`,
      provider: request.provider,
      model: request.model,
    }
  }

  return callOpenAiStoryGeneration(request, apiKey)
}
