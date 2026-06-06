import { useShallow } from 'zustand/react/shallow'
import { useStoryGeneratorStore } from '../stores/useStoryGeneratorStore'

export function useSetupData() {
  return useStoryGeneratorStore((state) => state.setupData)
}

export function useGeneratedStory() {
  return useStoryGeneratorStore((state) => state.generatedStory)
}

export function useActiveDraftId() {
  return useStoryGeneratorStore((state) => state.activeDraftId)
}

export function useCreatedAt() {
  return useStoryGeneratorStore((state) => state.createdAt)
}

export function useStoryWorkflowActions() {
  return useStoryGeneratorStore(
    useShallow((state) => ({
      setSetupData: state.setSetupData,
      setGeneratedStory: state.setGeneratedStory,
      setActiveDraftId: state.setActiveDraftId,
      setCreatedAt: state.setCreatedAt,
      resetStoryWorkflow: state.resetStoryWorkflow,
    })),
  )
}
