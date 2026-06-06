import { getGenerationConfig } from '@/shared/config'

const DEFAULT_STORY_GENERATION_API_PATH = '/api/story-generation'
const DEFAULT_AI_PROVIDER = 'openai'
const DEFAULT_AI_MODEL = 'gpt-4o-mini'

function readEnvString(key: keyof ImportMetaEnv): string {
  return import.meta.env[key]?.trim() ?? ''
}

/** Public API route for story generation — no secrets in the URL. */
export function getStoryGenerationApiUrl(): string {
  return readEnvString('VITE_STORY_GENERATION_API_URL') || DEFAULT_STORY_GENERATION_API_PATH
}

/** Non-secret provider id forwarded to the backend. */
export function getStoryGenerationProviderId(): string {
  const config = getGenerationConfig()

  return config.ai.provider || DEFAULT_AI_PROVIDER
}

/** Non-secret model name forwarded to the backend. */
export function getStoryGenerationModelName(): string {
  const config = getGenerationConfig()
  const configuredModel = config.ai.model || config.ai.openAiModel

  return configuredModel || DEFAULT_AI_MODEL
}

/** True when the dashboard create flow should attempt real AI via the backend. */
export function isRealAiGenerationFeatureEnabled(): boolean {
  return getGenerationConfig().isRealAiMode
}
