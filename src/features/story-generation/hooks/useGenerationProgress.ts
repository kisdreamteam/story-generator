import { useGenerationProgressContextOptional } from '../generationProgressContext'
import type { GenerationStage, GenerationStageError } from '../generationTypes'
import {
  INITIAL_GENERATION_PROGRESS_SNAPSHOT,
  type GenerationProgressSnapshot,
  type GenerationRunStatus,
} from '../lib/generationProgressSnapshot'

export interface UseGenerationProgressResult {
  snapshot: GenerationProgressSnapshot
  currentStep: GenerationStage | null
  percentage: number
  status: GenerationRunStatus
  errors: GenerationStageError[]
  isRunning: boolean
  isIdle: boolean
  isComplete: boolean
  hasErrors: boolean
  resetProgress: () => void
}

const FALLBACK: UseGenerationProgressResult = {
  snapshot: INITIAL_GENERATION_PROGRESS_SNAPSHOT,
  currentStep: null,
  percentage: 0,
  status: 'idle',
  errors: [],
  isRunning: false,
  isIdle: true,
  isComplete: false,
  hasErrors: false,
  resetProgress: () => {},
}

/** Subscribe to pipeline progress — safe outside {@link GenerationProgressProvider}. */
export function useGenerationProgress(): UseGenerationProgressResult {
  const context = useGenerationProgressContextOptional()

  if (!context) {
    return FALLBACK
  }

  const { snapshot, currentStep, percentage, status, errors, resetProgress } = context

  return {
    snapshot,
    currentStep,
    percentage,
    status,
    errors,
    isRunning: status === 'running',
    isIdle: status === 'idle',
    isComplete: status === 'success' || status === 'partial' || status === 'failed',
    hasErrors: errors.length > 0,
    resetProgress,
  }
}
