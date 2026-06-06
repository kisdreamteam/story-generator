import { getProjectById } from '../../story-projects/services/projects.service'
import type { StoryGenerationInput, StoryGenerationOutput } from '../types'
import type { FallbackReason, GenerationMode } from '../types/ai.types'
import type { StoryGenerationResult } from '../validation.types'
import { getAiConfig, isAiGenerationEnabled } from './aiConfig.service'
import {
  shouldSimulateGenerationLatency,
  simulateGenerationLatency,
} from './generationLatency.service'
import { mockFlashcards, mockImagePrompts, mockPages } from './mockStoryData'
import { parseAiStoryResponseToGeneratedStory } from '../parsers'
import { requestAiStoryGeneration } from './requestAiStoryGeneration'
import { buildStoryPrompt } from './storyPrompt.service'
import { validateStoryOutput } from './validateStoryOutput.service'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function buildMockOutput(input: StoryGenerationInput): StoryGenerationOutput {
  const project = getProjectById(input.projectId)
  const pages = mockPages.slice(0, input.pageCount).map((page) => ({
    ...page,
    wordCount: countWords(page.text),
  }))

  const totalWordCount = pages.reduce((total, page) => total + page.wordCount, 0)

  return {
    projectId: input.projectId,
    generatedAt: new Date().toISOString(),
    title: project?.title ?? capitalizeTheme(input.theme),
    summary: `An English-language ${input.ageRange} Nina & Nino story set in ${input.setting}, focused on ${input.vocabularyFocus}. ${input.learningGoal}`,
    pages,
    flashcards: mockFlashcards,
    imagePrompts: mockImagePrompts.slice(0, input.pageCount),
    totalWordCount,
  }
}

interface AiAttemptResult {
  result: StoryGenerationResult | null
  lastAiError?: string
  fallbackReason?: FallbackReason
}

function tryAiGeneration(input: StoryGenerationInput): AiAttemptResult {
  const config = getAiConfig()
  const prompt = buildStoryPrompt(input)

  const apiResponse = requestAiStoryGeneration({
    prompt,
    input,
    provider: config.provider,
    requestedModel: config.model,
  })

  if (!apiResponse.ok) {
    return {
      result: null,
      lastAiError: apiResponse.errorMessage,
      fallbackReason: 'api-not-connected',
    }
  }

  if (!apiResponse.rawText) {
    return {
      result: null,
      lastAiError: 'AI generation API returned no story text.',
      fallbackReason: 'api-not-connected',
    }
  }

  const parsedResult = parseAiStoryResponseToGeneratedStory(apiResponse.rawText, {
    expectedPageCount: input.pageCount,
  })

  if (!parsedResult.ok) {
    return {
      result: null,
      lastAiError: parsedResult.error,
      fallbackReason: 'parse-failed',
    }
  }

  const parsed: StoryGenerationOutput = {
    projectId: input.projectId,
    generatedAt: parsedResult.story.generatedAt,
    title: parsedResult.story.title,
    summary: parsedResult.story.summary,
    pages: parsedResult.story.storyPages,
    flashcards: parsedResult.story.flashcards,
    imagePrompts: parsedResult.story.imagePrompts,
    totalWordCount: parsedResult.story.totalWordCount,
  }

  const validation = validateStoryOutput(parsed)
  if (!validation.isValid) {
    return {
      result: null,
      lastAiError: `AI response failed validation: ${validation.errors.join('; ')}`,
      fallbackReason: 'validation-failed',
    }
  }

  return {
    result: {
      output: parsed,
      validation,
      generationMode: 'ai',
    },
  }
}

function buildFallbackResult(
  input: StoryGenerationInput,
  lastAiError?: string,
  fallbackReason?: FallbackReason,
): StoryGenerationResult {
  // Fallback protects the teacher experience: always show a usable story when AI fails.
  return {
    ...buildMockResult(input, 'fallback'),
    lastAiError,
    fallbackReason,
  }
}

function buildMockResult(input: StoryGenerationInput, mode: GenerationMode): StoryGenerationResult {
  const output = buildMockOutput(input)
  const validation = validateStoryOutput(output)

  return { output, validation, generationMode: mode }
}

/**
 * Main story generation orchestrator (async).
 *
 * Modes:
 * - mock: AI disabled — local mock data (default dev path)
 * - ai: valid response from fixture or future backend
 * - fallback: AI enabled but failed — mock backup + lastAiError for Debug
 *
 * Never calls an AI provider from the browser.
 */
export async function generateStoryOutput(
  input: StoryGenerationInput,
): Promise<StoryGenerationResult> {
  try {
    if (shouldSimulateGenerationLatency()) {
      await simulateGenerationLatency()
    }

    if (isAiGenerationEnabled()) {
      const { result, lastAiError, fallbackReason } = tryAiGeneration(input)
      if (result) {
        return result
      }

      return buildFallbackResult(input, lastAiError, fallbackReason)
    }

    return buildMockResult(input, 'mock')
  } catch {
    return buildFallbackResult(
      input,
      'Story generation failed unexpectedly.',
      'unexpected-error',
    )
  }
}

function capitalizeTheme(theme: string): string {
  if (!theme) return 'Untitled Story'
  return theme.charAt(0).toUpperCase() + theme.slice(1)
}
