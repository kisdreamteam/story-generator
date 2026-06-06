import { generateImagePrompts } from '../image-generation'
import { GenerationMode, getGenerationMode } from '@/shared/config'
import { mockStoryGenerationProvider } from './mockStoryGenerationProvider'
import type { StoryGenerationProvider } from './storyGenerationProvider'
import {
  cancelActiveStoryGeneration,
  enqueueStoryGeneration,
  type EnqueueStoryGenerationOptions,
} from './runtime/generationQueue'
import { isGenerationAbortedError, throwIfAborted } from './runtime/generationAbort'
import type { GeneratedStoryOutput, StoryGenerationInput } from './types'
import {
  canGenerate,
  estimateTokenUsage,
  recordGeneration,
  type GenerationProviderKind,
} from '../usage'
import { assertValidGeneratedStoryOutput } from './validateGeneratedStoryOutput'

async function resolveStoryGenerationProvider(): Promise<StoryGenerationProvider> {
  if (getGenerationMode() === GenerationMode.AI) {
    const { openAIStoryGenerationProvider } = await import('./providers/openAIStoryGenerationProvider')
    return openAIStoryGenerationProvider
  }

  return mockStoryGenerationProvider
}

function resolveProviderKind(mode: GenerationMode, usedOpenAi: boolean): GenerationProviderKind {
  if (usedOpenAi) return 'openai'
  if (mode === GenerationMode.FIXTURE) return 'fixture'
  return 'mock'
}

async function runWithProvider(
  input: StoryGenerationInput,
  provider: StoryGenerationProvider,
  signal: AbortSignal,
): Promise<GeneratedStoryOutput> {
  throwIfAborted(signal)

  const providerOptions = { signal }
  const story = await provider.generateStory(input, providerOptions)

  throwIfAborted(signal)

  const [flashcards, imagePrompts] = await Promise.all([
    provider.generateFlashcards(input, story, providerOptions),
    generateImagePrompts({ storyInput: input, story }, providerOptions),
  ])

  throwIfAborted(signal)

  const output: GeneratedStoryOutput = {
    title: story.title,
    summary: story.summary,
    storyPages: story.storyPages,
    flashcards,
    imagePrompts,
    totalWordCount: story.totalWordCount,
    generatedAt: story.generatedAt,
  }

  assertValidGeneratedStoryOutput(output)

  return output
}

async function generateWithOptionalAiFallback(
  input: StoryGenerationInput,
  provider: StoryGenerationProvider,
  signal: AbortSignal,
  mode: GenerationMode,
): Promise<{ output: GeneratedStoryOutput; usedOpenAi: boolean }> {
  if (mode !== GenerationMode.AI) {
    return {
      output: await runWithProvider(input, provider, signal),
      usedOpenAi: false,
    }
  }

  try {
    return {
      output: await runWithProvider(input, provider, signal),
      usedOpenAi: true,
    }
  } catch (error) {
    if (isGenerationAbortedError(error)) {
      throw error
    }

    console.warn(
      '[Story Generation] AI provider failed; using mock fallback.',
      error instanceof Error ? error.message : error,
    )

    return {
      output: await runWithProvider(input, mockStoryGenerationProvider, signal),
      usedOpenAi: false,
    }
  }
}

async function executeStoryGeneration(
  input: StoryGenerationInput,
  signal: AbortSignal,
): Promise<GeneratedStoryOutput> {
  throwIfAborted(signal)

  const generationCheck = canGenerate()

  if (!generationCheck.allowed) {
    throw new Error(generationCheck.reason ?? 'Story generation is not allowed right now.')
  }

  const mode = getGenerationMode()
  const provider = await resolveStoryGenerationProvider()
  const { output, usedOpenAi } = await generateWithOptionalAiFallback(input, provider, signal, mode)

  recordGeneration({
    provider: resolveProviderKind(mode, usedOpenAi),
    generationMode: mode,
    estimatedTokens: estimateTokenUsage(input, output),
    input,
    output,
  })

  return output
}

/** Cancel the active queued generation, if any. */
export function cancelStoryGeneration(): boolean {
  return cancelActiveStoryGeneration()
}

/** Orchestrates story generation through the queue and active provider. UI should call this only. */
export async function generateStory(
  input: StoryGenerationInput,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput> {
  return enqueueStoryGeneration(input, executeStoryGeneration, options)
}
