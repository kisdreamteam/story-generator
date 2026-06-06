import { StoryGenerationApiError } from './storyGenerationApi'
import {
  getStoryGenerationApiUrl,
  getStoryGenerationModelName,
  getStoryGenerationProviderId,
} from './storyGenerationBackend.config'
import type {
  StoryGenerationBackendRequest,
  StoryGenerationBackendResponse,
} from './storyGenerationBackend.types'
import { STORY_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE } from './storyGenerationBackend.types'
import { buildStoryGenerationPrompt } from '../prompts'
import type { StorySetupInput } from '@/features/stories/types'

export interface RequestStoryGenerationFromBackendOptions {
  signal?: AbortSignal
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new StoryGenerationApiError('ABORTED', 'Story generation request was cancelled.', {
      cause: signal.reason,
    })
  }
}

function buildBackendRequest(setup: StorySetupInput): StoryGenerationBackendRequest {
  const prompt = buildStoryGenerationPrompt(setup)

  return {
    setup,
    prompt: {
      system: prompt.system,
      user: prompt.user,
    },
    provider: getStoryGenerationProviderId(),
    model: getStoryGenerationModelName(),
  }
}

function mapFetchFailure(error: unknown): StoryGenerationApiError {
  if (error instanceof StoryGenerationApiError) {
    return error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new StoryGenerationApiError('ABORTED', 'Story generation request was cancelled.', {
      cause: error,
    })
  }

  if (error instanceof TypeError) {
    return new StoryGenerationApiError('NETWORK', 'Story generation API is unreachable.', {
      cause: error,
    })
  }

  return new StoryGenerationApiError(
    'UNKNOWN',
    'Story generation request failed.',
    { cause: error },
  )
}

/**
 * POST teacher setup + prompt to our backend. Never calls an AI provider from the browser.
 */
export async function requestStoryGenerationFromBackend(
  setup: StorySetupInput,
  options: RequestStoryGenerationFromBackendOptions = {},
): Promise<StoryGenerationBackendResponse> {
  throwIfAborted(options.signal)

  const request = buildBackendRequest(setup)
  const apiUrl = getStoryGenerationApiUrl()

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options.signal,
    })

    throwIfAborted(options.signal)

    let data: StoryGenerationBackendResponse

    try {
      data = (await response.json()) as StoryGenerationBackendResponse
    } catch {
      throw new StoryGenerationApiError(
        'PROVIDER',
        `Story generation API returned an invalid response (${response.status}).`,
      )
    }

    if (!response.ok && data.ok !== false) {
      return {
        ok: false,
        errorMessage:
          data.errorMessage ??
          `Story generation API returned ${response.status}.`,
        provider: data.provider ?? request.provider,
        model: data.model ?? request.model,
      }
    }

    return data
  } catch (error) {
    throw mapFetchFailure(error)
  }
}

export function toStoryGenerationApiErrorFromBackendResponse(
  response: StoryGenerationBackendResponse,
): StoryGenerationApiError {
  const message =
    response.errorMessage?.trim() ||
    STORY_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE

  return new StoryGenerationApiError('PROVIDER', message)
}
