import type { GenerationProgress, GenerationStage } from '../generationTypes'

const STAGE_ORDER: GenerationStage[] = [
  'validate',
  'story',
  'flashcards',
  'imagePrompts',
  'combine',
]

/** Derive a 0–100 percentage from pipeline stage completion. */
export function calculateGenerationPercentage(progress: GenerationProgress): number {
  const stageWeight = 100 / STAGE_ORDER.length
  let percentage = 0

  for (const stage of STAGE_ORDER) {
    const status = progress.stages[stage]

    if (status === 'completed') {
      percentage += stageWeight
      continue
    }

    if (status === 'running') {
      percentage += stageWeight * 0.5
    }

    break
  }

  return Math.min(100, Math.round(percentage))
}

export { STAGE_ORDER as GENERATION_STAGE_ORDER }
