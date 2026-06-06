import { getAiConfig } from './aiConfig.service'
import type { AiGenerationDebugStatus, FallbackReason, GenerationMode } from '../types/ai.types'

export function buildAiGenerationDebugStatus(
  generationMode: GenerationMode,
  lastAiError?: string,
  fallbackReason?: FallbackReason,
): AiGenerationDebugStatus {
  const config = getAiConfig()

  return {
    enabled: config.enabled,
    fixtureMode: config.fixtureMode,
    provider: config.provider || '(not set)',
    model: config.model || '(not set)',
    generationMode,
    lastAiError: generationMode === 'fallback' ? lastAiError : undefined,
    fallbackReason: generationMode === 'fallback' ? fallbackReason : undefined,
  }
}
