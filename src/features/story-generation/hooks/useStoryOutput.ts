import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { buildStoryGenerationInput } from '../services/buildStoryGenerationInput'
import { generateStoryOutput } from '../services/storyGeneration.service'
import { buildStoryPrompt } from '../services/storyPrompt.service'
import { buildAiGenerationDebugStatus } from '../services/buildAiGenerationDebugStatus.service'
import {
  getStoryOutputError,
  isStoryOutputReady,
} from '../services/storyOutputStatus.service'
import { validateStoryOutput } from '../services/validateStoryOutput.service'
import { useProjectRouteState } from '../../story-projects/hooks/useProjectRouteState'
import type { StoryGenerationOutput } from '../types'
import type { FallbackReason, GenerationMode } from '../types/ai.types'
import type { ValidationResult } from '../validation.types'

const EMPTY_VALIDATION: ValidationResult = { isValid: false, errors: [] }

export function useStoryOutput() {
  const { projectId } = useParams<{ projectId: string }>()
  const routeState = useProjectRouteState()

  const generationInput = useMemo(
    () =>
      routeState.generationInput ??
      buildStoryGenerationInput({ projectId: projectId ?? 'unknown' }),
    [projectId, routeState.generationInput],
  )

  const prompt = useMemo(
    () => buildStoryPrompt(generationInput),
    [generationInput],
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [story, setStory] = useState<StoryGenerationOutput | null>(null)
  const [validation, setValidation] = useState<ValidationResult>(EMPTY_VALIDATION)
  const [generationMode, setGenerationMode] = useState<GenerationMode>('mock')
  const [lastAiError, setLastAiError] = useState<string | undefined>()
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | undefined>()

  useEffect(() => {
    let cancelled = false

    async function runGeneration() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await generateStoryOutput(generationInput)

        const output = routeState.title
          ? { ...result.output, title: routeState.title }
          : result.output

        const outputValidation = validateStoryOutput(output)

        if (cancelled) return

        setStory(output)
        setValidation(outputValidation)
        setGenerationMode(result.generationMode)
        setLastAiError(result.lastAiError)
        setFallbackReason(result.fallbackReason)
      } catch {
        // Last-resort guard; generateStoryOutput already returns fallback mock on failure.
        if (cancelled) return

        setError('Story generation failed unexpectedly. Please try again from setup.')
        setStory(null)
        setValidation(EMPTY_VALIDATION)
        setGenerationMode('fallback')
        setLastAiError('Story generation failed unexpectedly.')
        setFallbackReason('unexpected-error')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void runGeneration()

    return () => {
      cancelled = true
    }
  }, [generationInput, routeState.title])

  const aiStatus = useMemo(
    () => buildAiGenerationDebugStatus(generationMode, lastAiError, fallbackReason),
    [generationMode, lastAiError, fallbackReason],
  )

  const showFallbackNotice = generationMode === 'fallback'

  const outputError = useMemo(
    () => error ?? getStoryOutputError(story, validation),
    [error, story, validation],
  )

  const isOutputReady = useMemo(
    () => !isLoading && isStoryOutputReady(story, validation),
    [isLoading, story, validation],
  )

  const targetWordCount = generationInput.pageCount * 80
  const wordCountPercent = story
    ? Math.round((story.totalWordCount / targetWordCount) * 100)
    : 0

  return {
    projectId,
    story,
    generationInput,
    prompt,
    validation,
    generationMode,
    aiStatus,
    showFallbackNotice,
    isLoading,
    error,
    outputError,
    isOutputReady,
    targetWordCount,
    wordCountPercent,
  }
}
