import type { GenerationProgress, GenerationStage, GenerationStageStatus } from './generationTypes'

const STAGE_ORDER: GenerationStage[] = [
  'validate',
  'story',
  'flashcards',
  'imagePrompts',
  'combine',
]

export const GENERATION_STAGE_ORDER = STAGE_ORDER

export function getGenerationStageIndex(stage: GenerationStage): number {
  return STAGE_ORDER.indexOf(stage)
}

export function getNextGenerationStage(stage: GenerationStage): GenerationStage | null {
  const index = getGenerationStageIndex(stage)
  return index < 0 || index >= STAGE_ORDER.length - 1 ? null : STAGE_ORDER[index + 1]
}

function createStageMap(status: GenerationStageStatus): GenerationProgress['stages'] {
  return {
    validate: status,
    story: status,
    flashcards: status,
    imagePrompts: status,
    combine: status,
  }
}

export function createGenerationProgress(): GenerationProgress {
  return {
    currentStage: null,
    stages: createStageMap('pending'),
  }
}

export function startGenerationStage(
  progress: GenerationProgress,
  stage: GenerationStage,
): GenerationProgress {
  return {
    currentStage: stage,
    stages: {
      ...progress.stages,
      [stage]: 'running',
    },
  }
}

export function completeGenerationStage(
  progress: GenerationProgress,
  stage: GenerationStage,
): GenerationProgress {
  const stages = { ...progress.stages, [stage]: 'completed' as const }
  const currentStage =
    STAGE_ORDER.find((item) => stages[item] === 'pending' || stages[item] === 'running') ?? null

  return {
    currentStage,
    stages,
  }
}

export function failGenerationStage(
  progress: GenerationProgress,
  stage: GenerationStage,
): GenerationProgress {
  const stageIndex = STAGE_ORDER.indexOf(stage)
  const skippedStages = STAGE_ORDER.slice(stageIndex + 1)

  const stages = {
    ...progress.stages,
    [stage]: 'failed' as const,
  }

  for (const skippedStage of skippedStages) {
    if (stages[skippedStage] === 'pending') {
      stages[skippedStage] = 'skipped'
    }
  }

  return {
    currentStage: stage,
    stages,
  }
}

export function notifyGenerationProgress(
  progress: GenerationProgress,
  onProgress?: (next: GenerationProgress) => void,
): GenerationProgress {
  onProgress?.(progress)
  return progress
}

export function isGenerationStageComplete(
  progress: GenerationProgress,
  stage: GenerationStage,
): boolean {
  return progress.stages[stage] === 'completed'
}

export function skipGenerationStage(
  progress: GenerationProgress,
  stage: GenerationStage,
): GenerationProgress {
  return {
    ...progress,
    stages: {
      ...progress.stages,
      [stage]: 'skipped',
    },
  }
}

export function resetGenerationStagesFrom(
  progress: GenerationProgress,
  fromStage: GenerationStage,
): GenerationProgress {
  const fromIndex = STAGE_ORDER.indexOf(fromStage)
  const stages = { ...progress.stages }

  for (const stage of STAGE_ORDER.slice(fromIndex)) {
    stages[stage] = 'pending'
  }

  return {
    currentStage: null,
    stages,
  }
}
