import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelStoryGeneration,
  generateStory,
  isGenerationAbortedError,
  storyGenerationInputFromSetup,
} from '../lib/generation'
import { persistGeneratedStory } from '../lib/generation/persistGeneratedStory'
import type { GeneratedStoryOutput } from '../lib/generation/types'
import type { StorySetupInput } from '../types/story-generator.types'
import { useGenerationActions } from './useGenerationSelectors'
import { useStoryDraft } from './useStoryDraft'
import { useStoryWorkflowActions } from './useStoryGeneratorSelectors'

/**
 * Orchestrates the dashboard create-story generation pipeline:
 * generation store → storyGenerationService → persist → story detail route.
 */
export function useStoryGenerationFlow() {
  const navigate = useNavigate()
  const { saveDraft, activeDraftId, createdAt } = useStoryDraft()
  const workflow = useStoryWorkflowActions()
  const { startGeneration, finishGeneration, failGeneration } = useGenerationActions()

  const navigateToStoryDetail = useCallback(
    (storyId: string) => {
      navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
    },
    [navigate],
  )

  const saveGeneratedStory = useCallback(
    async (setupData: StorySetupInput, output: GeneratedStoryOutput) => {
      return persistGeneratedStory(setupData, output, {
        activeDraftId,
        createdAt,
        saveDraft,
      })
    },
    [activeDraftId, createdAt, saveDraft],
  )

  const runGeneration = useCallback(
    async (setupData: StorySetupInput): Promise<GeneratedStoryOutput> => {
      const generationId = startGeneration()

      try {
        const output = await generateStory(storyGenerationInputFromSetup(setupData))
        workflow.setGeneratedStory(output)
        finishGeneration(generationId)
        return output
      } catch (error) {
        if (isGenerationAbortedError(error)) {
          throw error
        }

        const message =
          error instanceof Error ? error.message : 'Story generation failed unexpectedly.'
        failGeneration(generationId, message)
        throw error
      }
    },
    [failGeneration, finishGeneration, startGeneration, workflow],
  )

  const cancelGeneration = useCallback(() => {
    cancelStoryGeneration()
  }, [])

  return {
    runGeneration,
    saveGeneratedStory,
    navigateToStoryDetail,
    cancelGeneration,
  }
}
