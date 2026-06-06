import { useShallow } from 'zustand/react/shallow'
import { useGenerationStore, type GenerationFailureState, type GenerationStatus } from '../stores/useGenerationStore'

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

export function useGenerationFailureState(): GenerationFailureState {
  return useGenerationStore(
    useShallow((state) => ({
      kind: state.kind,
      message: state.message,
      canRetry: state.canRetry,
      hasPartialContent: state.hasPartialContent,
      cancelled: state.cancelled,
    })),
  )
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
