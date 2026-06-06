import { create } from 'zustand'
import type { GeneratedStory, StorySetupInput } from '../types/story-generator.types'

interface StoryGeneratorState {
  setupData: StorySetupInput | null
  generatedStory: GeneratedStory | null
  activeDraftId: string | null
  createdAt: string | null
  setSetupData: (setupData: StorySetupInput | null) => void
  setGeneratedStory: (generatedStory: GeneratedStory | null) => void
  setActiveDraftId: (activeDraftId: string | null) => void
  setCreatedAt: (createdAt: string | null) => void
  resetStoryWorkflow: () => void
}

export const useStoryGeneratorStore = create<StoryGeneratorState>((set) => ({
  setupData: null,
  generatedStory: null,
  activeDraftId: null,
  createdAt: null,
  setSetupData: (setupData) => set({ setupData }),
  setGeneratedStory: (generatedStory) => set({ generatedStory }),
  setActiveDraftId: (activeDraftId) => set({ activeDraftId }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  resetStoryWorkflow: () =>
    set({
      setupData: null,
      generatedStory: null,
      activeDraftId: null,
      createdAt: null,
    }),
}))
