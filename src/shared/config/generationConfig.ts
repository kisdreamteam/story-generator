import { GenerationMode } from './generationMode'

/** Env key for dashboard story generation mode. Set to mock, fixture, or ai — no code changes required. */
export const GENERATION_MODE_ENV_KEY = 'VITE_GENERATION_MODE'

export type GenerationModeKey = 'mock' | 'fixture' | 'ai'

export interface GenerationAiConfig {
  provider: string
  model: string
  openAiModel: string
  /** @deprecated Provider secrets belong in server env (OPENAI_API_KEY), not VITE_* */
  hasOpenAiApiKey: boolean
  promptVersion: string
  storyGenerationApiUrl: string
}

export interface GenerationConfig {
  mode: GenerationMode
  modeKey: GenerationModeKey
  isMockMode: boolean
  isFixtureMode: boolean
  isRealAiMode: boolean
  ai: GenerationAiConfig
}

const DEFAULT_MODE_KEY: GenerationModeKey = 'mock'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
const DEFAULT_PROMPT_VERSION = 'v1'

function readEnvString(key: keyof ImportMetaEnv): string {
  return import.meta.env[key]?.trim() ?? ''
}

function readEnvBoolean(key: keyof ImportMetaEnv): boolean {
  return readEnvString(key).toLowerCase() === 'true'
}

function parseGenerationModeKey(raw: string | undefined): GenerationModeKey | null {
  const normalized = raw?.trim().toLowerCase()

  switch (normalized) {
    case 'mock':
      return 'mock'
    case 'fixture':
      return 'fixture'
    case 'ai':
    case 'real':
    case 'openai':
      return 'ai'
    default:
      return null
  }
}

function toGenerationMode(modeKey: GenerationModeKey): GenerationMode {
  switch (modeKey) {
    case 'fixture':
      return GenerationMode.FIXTURE
    case 'ai':
      return GenerationMode.AI
    default:
      return GenerationMode.MOCK
  }
}

function resolveGenerationModeKey(): GenerationModeKey {
  const explicitMode = parseGenerationModeKey(readEnvString('VITE_GENERATION_MODE'))

  if (explicitMode) {
    return explicitMode
  }

  // Legacy Phase 2B flags — used only when VITE_GENERATION_MODE is unset.
  if (readEnvBoolean('VITE_AI_FIXTURE_MODE')) {
    return 'fixture'
  }

  if (readEnvBoolean('VITE_AI_GENERATION_ENABLED')) {
    return 'ai'
  }

  return DEFAULT_MODE_KEY
}

function buildGenerationAiConfig(): GenerationAiConfig {
  const provider = readEnvString('VITE_AI_PROVIDER')
  const model = readEnvString('VITE_AI_MODEL')
  const openAiModel = readEnvString('VITE_OPENAI_MODEL') || DEFAULT_OPENAI_MODEL
  const promptVersion = readEnvString('VITE_STORY_PROMPT_VERSION') || DEFAULT_PROMPT_VERSION
  const storyGenerationApiUrl =
    readEnvString('VITE_STORY_GENERATION_API_URL') || '/api/story-generation'

  return {
    provider,
    model,
    openAiModel,
    hasOpenAiApiKey: readEnvString('VITE_OPENAI_API_KEY').length > 0,
    promptVersion,
    storyGenerationApiUrl,
  }
}

let cachedGenerationConfig: GenerationConfig | null = null

/** Read generation mode and related env settings. Cached for the app lifetime. */
export function getGenerationConfig(): GenerationConfig {
  if (cachedGenerationConfig) {
    return cachedGenerationConfig
  }

  const modeKey = resolveGenerationModeKey()
  const mode = toGenerationMode(modeKey)

  cachedGenerationConfig = {
    mode,
    modeKey,
    isMockMode: modeKey === 'mock',
    isFixtureMode: modeKey === 'fixture',
    isRealAiMode: modeKey === 'ai',
    ai: buildGenerationAiConfig(),
  }

  return cachedGenerationConfig
}

/** Active generation mode from environment configuration. */
export function getGenerationMode(): GenerationMode {
  return getGenerationConfig().mode
}

/** True when generation mode is real AI (VITE_GENERATION_MODE=ai). */
export function isAIEnabled(): boolean {
  return getGenerationConfig().isRealAiMode
}

export function isMockGenerationMode(): boolean {
  return getGenerationConfig().isMockMode
}

export function isFixtureGenerationMode(): boolean {
  return getGenerationConfig().isFixtureMode
}

export function isRealAiGenerationMode(): boolean {
  return getGenerationConfig().isRealAiMode
}

/** Reset cached config — useful in tests when env is stubbed between cases. */
export function resetGenerationConfigCache(): void {
  cachedGenerationConfig = null
}
