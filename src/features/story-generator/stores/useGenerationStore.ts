import { create } from 'zustand'
import type { GenerationFailureKind } from '@/shared/ai/recovery'

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error'

export interface GenerationFailureState {
  kind: GenerationFailureKind | null
  message: string | null
  canRetry: boolean
  hasPartialContent: boolean
  cancelled: boolean
}

interface FailGenerationInput {
  message: string
  kind: GenerationFailureKind
  canRetry: boolean
  hasPartialContent: boolean
  cancelled?: boolean
}

interface GenerationState extends GenerationFailureState {
  status: GenerationStatus
  progress: number
  errors: string[]
  activeGenerationId: string | null
  startGeneration: () => string
  finishGeneration: (generationId: string) => void
  failGeneration: (generationId: string, failure: FailGenerationInput) => void
  resetGeneration: () => void
}

const initialFailureState: GenerationFailureState = {
  kind: null,
  message: null,
  canRetry: false,
  hasPartialContent: false,
  cancelled: false,
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  status: 'idle',
  progress: 0,
  errors: [],
  activeGenerationId: null,
  ...initialFailureState,

  startGeneration: () => {
    const current = get()

    if (current.status === 'generating' && current.activeGenerationId) {
      return current.activeGenerationId
    }

    const generationId = crypto.randomUUID()

    set({
      status: 'generating',
      progress: 0,
      errors: [],
      activeGenerationId: generationId,
      ...initialFailureState,
    })

    return generationId
  },

  finishGeneration: (generationId) => {
    set((state) => {
      if (state.activeGenerationId !== generationId) {
        return state
      }

      return {
        status: 'success',
        progress: 100,
        errors: [],
        activeGenerationId: null,
        ...initialFailureState,
      }
    })
  },

  failGeneration: (generationId, failure) => {
    set((state) => {
      if (state.activeGenerationId !== generationId) {
        return state
      }

      return {
        status: 'error',
        progress: 0,
        errors: [failure.message],
        activeGenerationId: null,
        kind: failure.kind,
        message: failure.message,
        canRetry: failure.canRetry,
        hasPartialContent: failure.hasPartialContent,
        cancelled: failure.cancelled ?? false,
      }
    })
  },

  resetGeneration: () => {
    set({
      status: 'idle',
      progress: 0,
      errors: [],
      activeGenerationId: null,
      ...initialFailureState,
    })
  },
}))
