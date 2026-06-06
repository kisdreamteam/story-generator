import { validateAIStoryInput } from '@/shared/ai/builders'
import type { GeneratedStory } from '@/features/stories/types'
import {
  requestStoryGenerationFromBackend,
  toStoryGenerationApiErrorFromBackendResponse,
} from '../api/storyGenerationBackend.client'
import {
  StoryGenerationApiError,
  type FlashcardResponse,
  type ImagePromptResponse,
  type StoryCoreResponse,
  type StoryGenerationRequest,
  type StoryGenerationRequestOptions,
} from '../api/storyGenerationApi'
import { parseAiStoryResponseToGeneratedStory } from '../parsers'
import type { AiGenerationAdapter } from './aiGenerationAdapter.types'

interface CachedRealAiGenerationResult {
  requestKey: string
  storyCore: StoryCoreResponse
  flashcards: FlashcardResponse[]
  imagePrompts: ImagePromptResponse[]
}

let cachedResult: CachedRealAiGenerationResult | null = null

function buildRequestKey(request: StoryGenerationRequest): string {
  return JSON.stringify(request.setup)
}

function toStoryCoreResponse(story: GeneratedStory): StoryCoreResponse {
  return {
    title: story.title,
    summary: story.summary,
    storyPages: story.storyPages,
    totalWordCount: story.totalWordCount,
    generatedAt: story.generatedAt,
  }
}

function assertCachedResult(
  request: StoryGenerationRequest,
  stage: 'flashcards' | 'imagePrompts',
): CachedRealAiGenerationResult {
  const requestKey = buildRequestKey(request)

  if (!cachedResult || cachedResult.requestKey !== requestKey) {
    throw new StoryGenerationApiError(
      'PROVIDER',
      `Real AI ${stage} generation requires a completed story response from the backend.`,
    )
  }

  return cachedResult
}

async function fetchAndCacheStory(
  request: StoryGenerationRequest,
  options?: StoryGenerationRequestOptions,
): Promise<StoryCoreResponse> {
  const requestKey = buildRequestKey(request)

  if (cachedResult?.requestKey === requestKey) {
    return cachedResult.storyCore
  }

  const backendResponse = await requestStoryGenerationFromBackend(request.setup, {
    signal: options?.signal,
  })

  if (!backendResponse.ok || !backendResponse.rawText?.trim()) {
    throw toStoryGenerationApiErrorFromBackendResponse(backendResponse)
  }

  const parsed = parseAiStoryResponseToGeneratedStory(backendResponse.rawText, {
    expectedPageCount: request.setup.pageCount,
  })

  if (!parsed.ok) {
    throw new StoryGenerationApiError('PROVIDER', parsed.error, {
      cause: parsed.validationErrors,
    })
  }

  const story = parsed.story
  cachedResult = {
    requestKey,
    storyCore: toStoryCoreResponse(story),
    flashcards: story.flashcards,
    imagePrompts: story.imagePrompts,
  }

  return cachedResult.storyCore
}

/**
 * Real AI adapter — calls our backend/API only. Provider secrets stay on the server.
 * The pipeline stages reuse one cached backend response for flashcards and image prompts.
 */
export const realAiGenerationAdapter: AiGenerationAdapter = {
  kind: 'real',
  id: 'openai',

  validate(request: StoryGenerationRequest) {
    return validateAIStoryInput({ setup: request.setup })
  },

  async generateStory(request, options) {
    return fetchAndCacheStory(request, options)
  },

  async generateFlashcards(request, _story, options) {
    if (cachedResult?.requestKey !== buildRequestKey(request)) {
      await fetchAndCacheStory(request, options)
    }

    return assertCachedResult(request, 'flashcards').flashcards
  },

  async generateImagePrompts(request, _story, options) {
    if (cachedResult?.requestKey !== buildRequestKey(request)) {
      await fetchAndCacheStory(request, options)
    }

    return assertCachedResult(request, 'imagePrompts').imagePrompts
  },
}

/** Clear cached backend response — useful in tests or between isolated runs. */
export function resetRealAiGenerationAdapterCache(): void {
  cachedResult = null
}
