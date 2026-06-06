import type {
  GenerationPipelineResult,
  GenerationProgress,
  GenerationStage,
  GenerationStageError,
} from '../generationTypes'
import { calculateGenerationPercentage } from './calculateGenerationPercentage'

export type GenerationRunStatus = 'idle' | 'running' | 'success' | 'partial' | 'failed'

export interface GenerationProgressSnapshot {
  currentStep: GenerationStage | null
  percentage: number
  status: GenerationRunStatus
  errors: GenerationStageError[]
  /** Raw pipeline stage map — for advanced UI subscribers. */
  stages: GenerationProgress['stages']
}

export const INITIAL_GENERATION_PROGRESS_SNAPSHOT: GenerationProgressSnapshot = {
  currentStep: null,
  percentage: 0,
  status: 'idle',
  errors: [],
  stages: {
    validate: 'pending',
    story: 'pending',
    flashcards: 'pending',
    imagePrompts: 'pending',
    combine: 'pending',
  },
}

export function buildRunningProgressSnapshot(
  progress: GenerationProgress,
): GenerationProgressSnapshot {
  return {
    currentStep: progress.currentStage,
    percentage: calculateGenerationPercentage(progress),
    status: 'running',
    errors: [],
    stages: progress.stages,
  }
}

export function buildCompletedProgressSnapshot(
  result: GenerationPipelineResult,
): GenerationProgressSnapshot {
  return {
    currentStep: result.progress.currentStage,
    percentage: result.status === 'success' ? 100 : calculateGenerationPercentage(result.progress),
    status: result.status,
    errors: result.errors,
    stages: result.progress.stages,
  }
}

export function buildRunningStartSnapshot(): GenerationProgressSnapshot {
  return {
    currentStep: 'validate',
    percentage: 0,
    status: 'running',
    errors: [],
    stages: {
      validate: 'running',
      story: 'pending',
      flashcards: 'pending',
      imagePrompts: 'pending',
      combine: 'pending',
    },
  }
}
