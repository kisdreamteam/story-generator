/**
 * Frontend AI flags only — no API keys here.
 * Provider and model names are non-secret config passed to our backend later.
 */
export function getAiConfig() {
  return {
    provider: import.meta.env.VITE_AI_PROVIDER ?? '',
    model: import.meta.env.VITE_AI_MODEL ?? '',
    enabled: import.meta.env.VITE_AI_GENERATION_ENABLED === 'true',
    fixtureMode: import.meta.env.VITE_AI_FIXTURE_MODE === 'true',
  }
}

export function isAiGenerationEnabled(): boolean {
  return getAiConfig().enabled
}

export function isAiFixtureModeEnabled(): boolean {
  return getAiConfig().fixtureMode
}
