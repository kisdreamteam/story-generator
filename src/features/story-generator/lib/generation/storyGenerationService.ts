import {
  GenerationRecoveryError,
  getPartialAIGenerationOutput,
  isGenerationRecoveryError,
  withGenerationTimeout,
  type PartialAIGenerationOutput,
} from '@/shared/ai/recovery'
import { buildAIStoryInput, buildStoryGenerationMetadataFromSetup, mockAIStoryProvider, resolveAIStoryProvider, type AIStoryProvider } from '@/shared/ai'
import { GenerationMode, getGenerationMode } from '@/shared/config'
import './registerAIProviders'
import { getActivePromptVersion } from '../../prompts/promptVersions'
import {
  cancelActiveStoryGeneration,
  enqueueStoryGeneration,
  retryActiveStoryGeneration,
  retryStoryGeneration,
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
import { mapAIResultToGeneratedStoryOutput } from './adapters/aiStoryOutputMapping'
import { buildPartialGeneratedStoryOutput } from './recovery/partialGenerationOutput'
import { productAnalytics } from '@/shared/lib/analytics'

function resolveProviderKind(mode: GenerationMode, provider: AIStoryProvider): GenerationProviderKind {
  if (provider.id === 'openai') return 'openai'
  if (mode === GenerationMode.FIXTURE) return 'fixture'
  return 'mock'
}

function resolveGenerationModel(provider: AIStoryProvider): string | null {
  if (provider.id !== 'openai') {
    return null
  }

  const model = import.meta.env.VITE_OPENAI_MODEL?.trim()
  return model || 'gpt-4o-mini'
}

function attachGenerationMetadata(
  output: GeneratedStoryOutput,
  input: StoryGenerationInput,
  providerKind: GenerationProviderKind,
  provider: AIStoryProvider,
): GeneratedStoryOutput {
  return {
    ...output,
    generationMetadata: buildStoryGenerationMetadataFromSetup(input.setup, {
      provider: providerKind,
      model: resolveGenerationModel(provider),
      generationVersion: getActivePromptVersion(),
      timestamp: output.generatedAt,
    }),
  }
}

function wrapProviderFailure(
  error: unknown,
  partialOutput: PartialAIGenerationOutput | null,
): never {
  if (isGenerationAbortedError(error)) {
    if (partialOutput) {
      throw new GenerationRecoveryError('Story generation was cancelled.', {
        partialOutput,
        cause: error,
      })
    }

    throw error
  }

  throw new GenerationRecoveryError(
    error instanceof Error ? error.message : 'Story generation failed.',
    {
      partialOutput,
      cause: error,
    },
  )
}

async function runWithProvider(
  input: StoryGenerationInput,
  provider: AIStoryProvider,
  signal: AbortSignal,
): Promise<GeneratedStoryOutput> {
  throwIfAborted(signal)

  const aiInput = buildAIStoryInput(input.setup)
  const validation = provider.validateInput(aiInput)

  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '))
  }

  const providerOptions = { signal }
  let storyResult

  try {
    storyResult = await provider.generateStory(aiInput, providerOptions)
  } catch (error) {
    wrapProviderFailure(error, null)
  }

  throwIfAborted(signal)

  const partialAfterStory: PartialAIGenerationOutput = {
    story: storyResult.story,
    flashcards: storyResult.flashcards,
    imagePrompts: [],
    stage: 'story',
  }

  let imagePrompts

  try {
    imagePrompts = await provider.generateImages(aiInput, storyResult.story, providerOptions)
  } catch (error) {
    wrapProviderFailure(error, partialAfterStory)
  }

  throwIfAborted(signal)

  const output = mapAIResultToGeneratedStoryOutput(storyResult.story, storyResult.flashcards, imagePrompts)

  assertValidGeneratedStoryOutput(output)

  return output
}

async function generateWithOptionalAiFallback(
  input: StoryGenerationInput,
  provider: AIStoryProvider,
  signal: AbortSignal,
  mode: GenerationMode,
): Promise<{ output: GeneratedStoryOutput; provider: AIStoryProvider }> {
  if (mode !== GenerationMode.AI) {
    return {
      output: await runWithProvider(input, provider, signal),
      provider,
    }
  }

  try {
    return {
      output: await runWithProvider(input, provider, signal),
      provider,
    }
  } catch (error) {
    if (isGenerationAbortedError(error) || isGenerationRecoveryError(error)) {
      throw error
    }

    console.warn(
      '[Story Generation] AI provider failed; using mock fallback.',
      error instanceof Error ? error.message : error,
    )

    return {
      output: await runWithProvider(input, mockAIStoryProvider, signal),
      provider: mockAIStoryProvider,
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
  const provider = await resolveAIStoryProvider()

  const { output, provider: usedProvider } = await withGenerationTimeout(
    (timeoutSignal) =>
      generateWithOptionalAiFallback(input, provider, timeoutSignal, mode),
    { parentSignal: signal },
  )

  recordGeneration({
    provider: resolveProviderKind(mode, usedProvider),
    generationMode: mode,
    estimatedTokens: estimateTokenUsage(input, output),
    input,
    output,
  })

  productAnalytics.storyGenerated({
    pageCount: output.storyPages.length,
    totalWordCount: output.totalWordCount,
    source: 'create_flow',
    provider: resolveProviderKind(mode, usedProvider),
  })

  return attachGenerationMetadata(output, input, resolveProviderKind(mode, usedProvider), usedProvider)
}

/** Extract recoverable partial output from a failed generation attempt. */
export function getRecoverablePartialOutput(error: unknown): GeneratedStoryOutput | null {
  const partial = getPartialAIGenerationOutput(error)

  if (!partial) {
    return null
  }

  return buildPartialGeneratedStoryOutput(partial)
}

/** Cancel the active queued generation, if any. */
export function cancelStoryGeneration(): boolean {
  return cancelActiveStoryGeneration()
}

/** Retry the most recent failed generation job, when attempts remain. */
export async function retryStoryGenerationJob(jobId?: string): Promise<GeneratedStoryOutput> {
  if (jobId) {
    return retryStoryGeneration(jobId)
  }

  return retryActiveStoryGeneration()
}

/** Orchestrates story generation through the queue and active provider. UI should call this only. */
export async function generateStory(
  input: StoryGenerationInput,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput> {
  return enqueueStoryGeneration(input, executeStoryGeneration, options)
}

export {
  GenerationRecoveryError,
  getPartialAIGenerationOutput,
  isGenerationRecoveryError,
} from '@/shared/ai/recovery'
