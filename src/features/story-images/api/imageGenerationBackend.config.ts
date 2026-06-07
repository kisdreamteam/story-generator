import { getImageGenerationConfig } from '@/shared/config/imageGenerationConfig'

const DEFAULT_IMAGE_GENERATION_API_PATH = '/api/image-generation'
const DEFAULT_IMAGE_PROVIDER = 'openai'
const DEFAULT_IMAGE_MODEL = 'dall-e-3'

function readEnvString(key: keyof ImportMetaEnv): string {
  return import.meta.env[key]?.trim() ?? ''
}

/** Public API route for image generation — no secrets in the URL. */
export function getImageGenerationApiUrl(): string {
  return readEnvString('VITE_IMAGE_GENERATION_API_URL') || DEFAULT_IMAGE_GENERATION_API_PATH
}

/** Non-secret provider id forwarded to the backend. */
export function getImageGenerationProviderId(): string {
  const config = getImageGenerationConfig()

  return config.provider || DEFAULT_IMAGE_PROVIDER
}

/** Non-secret model name forwarded to the backend. */
export function getImageGenerationModelName(): string {
  const config = getImageGenerationConfig()

  return config.model || DEFAULT_IMAGE_MODEL
}

/** True when story detail should attempt real illustrations via the backend. */
export function isRealImageGenerationFeatureEnabled(): boolean {
  return getImageGenerationConfig().isRealAiMode
}
