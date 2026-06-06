import {
  getGenerationUsageForDate,
  getTodayIsoDate,
  type GenerationProviderKind,
  recordGeneration,
  type RecordGenerationInput,
} from './generationUsage'

export interface GenerationLimitConfig {
  maxGenerationsPerDay: number
  maxEstimatedTokensPerDay: number
}

export interface CanGenerateResult {
  allowed: boolean
  reason?: string
  remainingGenerations: number
  remainingEstimatedTokens: number
}

/** Generous defaults — limits exist for future enforcement without changing current UX. */
const DEFAULT_LIMITS: GenerationLimitConfig = {
  maxGenerationsPerDay: 1000,
  maxEstimatedTokensPerDay: 1_000_000,
}

export function getGenerationLimits(): GenerationLimitConfig {
  return DEFAULT_LIMITS
}

export function canGenerate(at = new Date()): CanGenerateResult {
  const limits = getGenerationLimits()
  const todayUsage = getGenerationUsageForDate(getTodayIsoDate(at))

  const remainingGenerations = Math.max(0, limits.maxGenerationsPerDay - todayUsage.totalGenerations)
  const remainingEstimatedTokens = Math.max(
    0,
    limits.maxEstimatedTokensPerDay - todayUsage.totalEstimatedTokens,
  )

  if (remainingGenerations <= 0) {
    return {
      allowed: false,
      reason: 'Daily story generation limit reached.',
      remainingGenerations: 0,
      remainingEstimatedTokens,
    }
  }

  if (remainingEstimatedTokens <= 0) {
    return {
      allowed: false,
      reason: 'Daily estimated token limit reached.',
      remainingGenerations,
      remainingEstimatedTokens: 0,
    }
  }

  return {
    allowed: true,
    remainingGenerations,
    remainingEstimatedTokens,
  }
}

export { recordGeneration, type GenerationProviderKind, type RecordGenerationInput }
