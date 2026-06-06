import { useShallow } from 'zustand/react/shallow'
import { useGenerationStore, type GenerationStatus } from '../stores/useGenerationStore'

export function useGenerationStatus(): GenerationStatus {
  return useGenerationStore((state) => state.status)
}

export function useIsGenerating(): boolean {
  return useGenerationStore((state) => state.status === 'generating')
}

export function useGenerationProgress(): number {
  return useGenerationStore((state) => state.progress)
}

export function useGenerationErrors(): string[] {
  return useGenerationStore((state) => state.errors)
}

export function useGenerationActions() {
  return useGenerationStore(
    useShallow((state) => ({
      startGeneration: state.startGeneration,
      finishGeneration: state.finishGeneration,
      failGeneration: state.failGeneration,
      resetGeneration: state.resetGeneration,
    })),
  )
}
