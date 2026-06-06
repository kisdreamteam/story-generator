import type { GenerationPipelineResult, GenerationProgress } from '../generationTypes'

export interface GenerationProgressReporter {
  onRunStart: () => void
  onStageProgress: (progress: GenerationProgress) => void
  onRunComplete: (result: GenerationPipelineResult) => void
  reset: () => void
}

let activeReporter: GenerationProgressReporter | null = null

export function setGenerationProgressReporter(reporter: GenerationProgressReporter | null): void {
  activeReporter = reporter
}

export function notifyGenerationRunStart(): void {
  activeReporter?.onRunStart()
}

export function notifyGenerationStageProgress(progress: GenerationProgress): void {
  activeReporter?.onStageProgress(progress)
}

export function notifyGenerationRunComplete(result: GenerationPipelineResult): void {
  activeReporter?.onRunComplete(result)
}

export function resetGenerationProgressReporter(): void {
  activeReporter?.reset()
}
