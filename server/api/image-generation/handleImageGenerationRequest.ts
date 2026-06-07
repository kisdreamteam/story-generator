import {
  IMAGE_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE,
  validateImageGenerationBackendRequest,
  type ImageGenerationBackendRequest,
  type ImageGenerationBackendResponse,
} from './imageGeneration.contract'

const DEFAULT_IMAGE_SIZE = '1024x1024'

function resolveImageApiKey(): string | null {
  const dedicated = process.env.IMAGE_GENERATION_API_KEY?.trim()
  if (dedicated) {
    return dedicated
  }

  return process.env.OPENAI_API_KEY?.trim() || null
}

function buildProviderPrompt(request: ImageGenerationBackendRequest): string {
  const continuity = request.continuityReminder?.trim()

  return [
    `Storybook illustration for page ${request.pageNumber}.`,
    request.prompt.trim(),
    continuity ? `Continuity: ${continuity}` : '',
    "Children's book watercolor illustration, warm and classroom-safe.",
    'Nina (older sister) wears indigo; Nino (younger brother) wears emerald green — distinct ages, not twins.',
    'No speech bubbles, captions, text boxes, signs with readable text, logos, or unsafe elements.',
  ]
    .filter(Boolean)
    .join(' ')
}

interface OpenAiImageResponse {
  data?: Array<{
    b64_json?: string | null
    url?: string | null
  }>
  error?: {
    message?: string
  }
}

async function callOpenAiImageGeneration(
  request: ImageGenerationBackendRequest,
  apiKey: string,
): Promise<ImageGenerationBackendResponse> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      prompt: buildProviderPrompt(request),
      n: 1,
      size: DEFAULT_IMAGE_SIZE,
      response_format: 'b64_json',
    }),
  })

  let payload: OpenAiImageResponse

  try {
    payload = (await response.json()) as OpenAiImageResponse
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
        `OpenAI image request failed with status ${response.status}.`,
      provider: request.provider,
      model: request.model,
    }
  }

  const b64 = payload.data?.[0]?.b64_json?.trim()
  const url = payload.data?.[0]?.url?.trim()

  if (b64) {
    return {
      ok: true,
      imageUrl: `data:image/png;base64,${b64}`,
      provider: request.provider,
      model: request.model,
      generatedAt: new Date().toISOString(),
    }
  }

  if (url) {
    return {
      ok: true,
      imageUrl: url,
      provider: request.provider,
      model: request.model,
      generatedAt: new Date().toISOString(),
    }
  }

  return {
    ok: false,
    errorMessage: 'OpenAI returned an empty image response.',
    provider: request.provider,
    model: request.model,
  }
}

/**
 * Server-side single-page image generation handler.
 * Reads IMAGE_GENERATION_API_KEY or OPENAI_API_KEY from process.env — never VITE_*.
 */
export async function handleImageGenerationRequest(
  body: unknown,
): Promise<ImageGenerationBackendResponse> {
  if (!validateImageGenerationBackendRequest(body)) {
    return {
      ok: false,
      errorMessage: 'Invalid image generation request payload.',
    }
  }

  const request = body
  const apiKey = resolveImageApiKey()

  if (!apiKey) {
    return {
      ok: false,
      errorMessage: IMAGE_GENERATION_BACKEND_NOT_CONNECTED_MESSAGE,
      provider: request.provider,
      model: request.model,
    }
  }

  if (request.provider !== 'openai') {
    return {
      ok: false,
      errorMessage: `Provider "${request.provider}" is not supported by the image backend yet.`,
      provider: request.provider,
      model: request.model,
    }
  }

  return callOpenAiImageGeneration(request, apiKey)
}
