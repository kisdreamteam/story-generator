import { createContext, useContext } from 'react'
import type { GenerationStage, GenerationStageError } from './generationTypes'
import type { GenerationProgressSnapshot, GenerationRunStatus } from './lib/generationProgressSnapshot'

export interface GenerationProgressContextValue {
  snapshot: GenerationProgressSnapshot
  currentStep: GenerationStage | null
  percentage: number
  status: GenerationRunStatus
  errors: GenerationStageError[]
  resetProgress: () => void
}

export const GenerationProgressContext = createContext<GenerationProgressContextValue | null>(null)

export function useGenerationProgressContext(): GenerationProgressContextValue {
  const value = useContext(GenerationProgressContext)

  if (!value) {
    throw new Error('useGenerationProgressContext must be used within GenerationProgressProvider')
  }

  return value
}

export function useGenerationProgressContextOptional(): GenerationProgressContextValue | null {
  return useContext(GenerationProgressContext)
}
