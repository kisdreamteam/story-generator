import type {
  AiStoryGenerationApiRequest,
  AiStoryGenerationApiResponse,
} from '../types/ai.types'
import { isAiFixtureModeEnabled, isAiGenerationEnabled } from './aiConfig.service'
import { getAiStoryResponseFixtureRaw } from './aiStoryResponseFixture.service'

const API_NOT_CONNECTED = 'AI generation API is not connected yet.'

/**
 * Client-side wrapper that will POST to our backend/API in a later phase.
 * Never call AI providers or use secret keys from the browser.
 */
export function requestAiStoryGeneration(
  request: AiStoryGenerationApiRequest,
): AiStoryGenerationApiResponse {
  if (!request.provider.trim()) {
    return {
      ok: false,
      errorMessage: 'AI provider is not configured.',
      provider: request.provider,
      model: request.requestedModel,
    }
  }

  if (!request.requestedModel.trim()) {
    return {
      ok: false,
      errorMessage: 'AI model is not configured.',
      provider: request.provider,
      model: request.requestedModel,
    }
  }

  if (isAiGenerationEnabled() && isAiFixtureModeEnabled()) {
    // Fixture mode: return canned JSON to test parse + validation without a real provider.
    return {
      ok: true,
      rawText: getAiStoryResponseFixtureRaw(),
      provider: request.provider,
      model: request.requestedModel,
    }
  }

  // --- Future backend call (disabled until server is deployed) ---
  // Contract: server/api/story-generation/storyGeneration.contract.ts
  //
  // try {
  //   const response = await fetch('/api/story-generation', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(request satisfies AiStoryGenerationApiRequest),
  //   })
  //
  //   if (!response.ok) {
  //     return {
  //       ok: false,
  //       errorMessage: `Story generation API returned ${response.status}.`,
  //       provider: request.provider,
  //       model: request.requestedModel,
  //     }
  //   }
  //
  //   const data = (await response.json()) as AiStoryGenerationApiResponse
  //   return data
  // } catch {
  //   return {
  //     ok: false,
  //     errorMessage: 'Story generation API is unreachable.',
  //     provider: request.provider,
  //     model: request.requestedModel,
  //   }
  // }

  return {
    ok: false,
    errorMessage: API_NOT_CONNECTED,
    provider: request.provider,
    model: request.requestedModel,
  }
}
