import { getGenerationConfig } from '@/shared/config/generationConfig'

/**
 * Frontend AI flags only — no API keys here.
 * Provider and model names are non-secret config passed to our backend later.
 */
export function getAiConfig() {
  const config = getGenerationConfig()

  return {
    provider: config.ai.provider,
    model: config.ai.model,
    enabled: config.isRealAiMode,
    fixtureMode: config.isFixtureMode,
  }
}

export function isAiGenerationEnabled(): boolean {
  return getGenerationConfig().isRealAiMode
}

export function isAiFixtureModeEnabled(): boolean {
  return getGenerationConfig().isFixtureMode
}
