import { create } from 'zustand'

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error'

interface GenerationState {
  status: GenerationStatus
  progress: number
  errors: string[]
  activeGenerationId: string | null
  startGeneration: () => string
  finishGeneration: (generationId: string) => void
  failGeneration: (generationId: string, error: string) => void
  resetGeneration: () => void
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  status: 'idle',
  progress: 0,
  errors: [],
  activeGenerationId: null,

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
      }
    })
  },

  failGeneration: (generationId, error) => {
    set((state) => {
      if (state.activeGenerationId !== generationId) {
        return state
      }

      return {
        status: 'error',
        progress: 0,
        errors: [error],
        activeGenerationId: null,
      }
    })
  },

  resetGeneration: () => {
    set({
      status: 'idle',
      progress: 0,
      errors: [],
      activeGenerationId: null,
    })
  },
}))
