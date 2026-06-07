/** Env key for page illustration mode. Set to mock or ai — independent of VITE_GENERATION_MODE. */
export const IMAGE_GENERATION_MODE_ENV_KEY = 'VITE_IMAGE_GENERATION_MODE'

export type ImageGenerationModeKey = 'mock' | 'ai'

export interface ImageGenerationConfig {
  modeKey: ImageGenerationModeKey
  isMockMode: boolean
  isRealAiMode: boolean
  provider: string
  model: string
  imageGenerationApiUrl: string
}

const DEFAULT_MODE_KEY: ImageGenerationModeKey = 'mock'

function readEnvString(key: keyof ImportMetaEnv): string {
  return import.meta.env[key]?.trim() ?? ''
}

function parseImageGenerationModeKey(raw: string | undefined): ImageGenerationModeKey | null {
  const normalized = raw?.trim().toLowerCase()

  switch (normalized) {
    case 'mock':
      return 'mock'
    case 'ai':
    case 'real':
    case 'openai':
      return 'ai'
    default:
      return null
  }
}

function resolveImageGenerationModeKey(): ImageGenerationModeKey {
  return parseImageGenerationModeKey(readEnvString('VITE_IMAGE_GENERATION_MODE')) ?? DEFAULT_MODE_KEY
}

let cachedImageGenerationConfig: ImageGenerationConfig | null = null

/** Read illustration mode and related env settings. Cached for the app lifetime. */
export function getImageGenerationConfig(): ImageGenerationConfig {
  if (cachedImageGenerationConfig) {
    return cachedImageGenerationConfig
  }

  const modeKey = resolveImageGenerationModeKey()

  cachedImageGenerationConfig = {
    modeKey,
    isMockMode: modeKey === 'mock',
    isRealAiMode: modeKey === 'ai',
    provider: readEnvString('VITE_IMAGE_PROVIDER'),
    model: readEnvString('VITE_IMAGE_MODEL'),
    imageGenerationApiUrl:
      readEnvString('VITE_IMAGE_GENERATION_API_URL') || '/api/image-generation',
  }

  return cachedImageGenerationConfig
}

export function isRealImageGenerationMode(): boolean {
  return getImageGenerationConfig().isRealAiMode
}

export function isMockImageGenerationMode(): boolean {
  return getImageGenerationConfig().isMockMode
}

/** Reset cached config — useful in tests when env is stubbed between cases. */
export function resetImageGenerationConfigCache(): void {
  cachedImageGenerationConfig = null
}
