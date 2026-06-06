import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { classifyGenerationFailure } from '@/shared/ai/recovery'
import { storyFeedback } from '@/shared/feedback'
import {
  cancelStoryGeneration,
  generateStory,
  getRecoverablePartialOutput,
  isGenerationAbortedError,
  retryStoryGenerationJob,
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

  const applyRecoveryState = useCallback(
    (generationId: string, error: unknown) => {
      const partialOutput = getRecoverablePartialOutput(error)

      if (partialOutput) {
        workflow.setGeneratedStory(partialOutput)
      }

      const failure = classifyGenerationFailure(error)
      failGeneration(generationId, {
        message: failure.message,
        kind: failure.kind,
        canRetry: failure.retryable,
        hasPartialContent: failure.hasPartialContent || Boolean(partialOutput),
        cancelled: failure.kind === 'cancelled',
      })

      if (failure.kind === 'cancelled') {
        return
      }

      storyFeedback.generationFailed(failure.message)
    },
    [failGeneration, workflow],
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
        applyRecoveryState(generationId, error)

        if (isGenerationAbortedError(error)) {
          throw error
        }

        throw error
      }
    },
    [applyRecoveryState, finishGeneration, startGeneration, workflow],
  )

  const retryGeneration = useCallback(
    async (setupData: StorySetupInput): Promise<GeneratedStoryOutput> => {
      const generationId = startGeneration()

      try {
        const output = await retryStoryGenerationJob()
        workflow.setGeneratedStory(output)
        finishGeneration(generationId)
        return output
      } catch (error) {
        try {
          const output = await generateStory(storyGenerationInputFromSetup(setupData))
          workflow.setGeneratedStory(output)
          finishGeneration(generationId)
          return output
        } catch (retryError) {
          applyRecoveryState(generationId, retryError)
          throw retryError
        }
      }
    },
    [applyRecoveryState, finishGeneration, startGeneration, workflow],
  )

  const cancelGeneration = useCallback(() => {
    cancelStoryGeneration()
  }, [])

  return {
    runGeneration,
    retryGeneration,
    saveGeneratedStory,
    navigateToStoryDetail,
    cancelGeneration,
  }
}
