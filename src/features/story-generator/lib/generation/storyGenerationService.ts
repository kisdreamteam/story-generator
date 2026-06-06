import { runGenerateStoryPipeline } from '@/features/story-generation/generateStoryPipeline'
import {
  buildRecoveryCheckpoint,
  buildRecoveryCheckpointFromResult,
  clearGenerationRecoverySession,
  createGenerationSessionId,
  getRecoverableGenerationSession,
  getInterruptedGenerationSession,
  mapPipelineStatusToSessionStatus,
  persistGenerationSession,
  resumeGenerateStoryPipeline,
  retryGenerateStoryPipelineStep,
} from '@/features/story-generation/generationRecovery'
import { createGenerationProgress } from '@/features/story-generation/generationProgress'
import { readPersistedGenerationSession } from '@/features/story-generation/generationSessionStorage'
import type { GenerationPipelineResult, GenerationStage } from '@/features/story-generation/generationTypes'
import type { PersistedGenerationSession } from '@/features/story-generation/generationSessionStorage'
import {
  notifyGenerationRunComplete,
  notifyGenerationRunStart,
  notifyGenerationStageProgress,
} from '@/features/story-generation/lib/generationProgressReporter'
import {
  GenerationRecoveryError,
  getPartialAIGenerationOutput,
  isGenerationRecoveryError,
  withGenerationTimeout,
  type PartialAIGenerationOutput,
} from '@/shared/ai/recovery'
import {
  getMockAiGenerationAdapter,
  resolveAiGenerationAdapter,
  type AiGenerationAdapter,
} from '@/features/story-generation/adapters'
import { GenerationMode, getGenerationConfig } from '@/shared/config'
import { getActivePromptVersion } from '../../prompts/promptVersions'
import {
  cancelActiveStoryGeneration,
  enqueueStoryGeneration,
  retryActiveStoryGeneration,
  retryStoryGeneration,
  type EnqueueStoryGenerationOptions,
} from './runtime/generationQueue'
import { GenerationAbortedError, isGenerationAbortedError, throwIfAborted } from './runtime/generationAbort'
import type { GeneratedStoryOutput, StoryGenerationInput } from './types'
import {
  canGenerate,
  estimateTokenUsage,
  recordGeneration,
  type GenerationProviderKind,
} from '../usage'
import { buildStoryGenerationMetadataFromSetup } from '@/shared/ai'
import { assertValidGeneratedStoryOutput } from './validateGeneratedStoryOutput'
import { buildPartialGeneratedStoryOutput } from './recovery/partialGenerationOutput'
import { productAnalytics } from '@/shared/lib/analytics'

function resolveProviderKind(mode: GenerationMode, adapter: AiGenerationAdapter): GenerationProviderKind {
  if (adapter.kind === 'real') return 'openai'
  if (mode === GenerationMode.FIXTURE) return 'fixture'
  return 'mock'
}

function resolveGenerationModel(adapter: AiGenerationAdapter): string | null {
  if (adapter.kind !== 'real') {
    return null
  }

  const model = import.meta.env.VITE_OPENAI_MODEL?.trim()
  return model || 'gpt-4o-mini'
}

function attachGenerationMetadata(
  output: GeneratedStoryOutput,
  input: StoryGenerationInput,
  providerKind: GenerationProviderKind,
  adapter: AiGenerationAdapter,
): GeneratedStoryOutput {
  return {
    ...output,
    generationMetadata: buildStoryGenerationMetadataFromSetup(input.setup, {
      provider: providerKind,
      model: resolveGenerationModel(adapter),
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

export type StoryGenerationRecoveryMode = 'fresh' | 'resume' | 'retry'

export interface RunStoryGenerationOptions {
  recovery?: StoryGenerationRecoveryMode
  retryStage?: GenerationStage
}

async function runPipelineWithRecovery(
  input: StoryGenerationInput,
  adapter: AiGenerationAdapter,
  signal: AbortSignal,
  runOptions: RunStoryGenerationOptions = {},
): Promise<GenerationPipelineResult> {
  const pipelineInput = { setup: input.setup }
  const pipelineOptions = {
    adapter,
    signal,
    onProgress: notifyGenerationStageProgress,
    onCheckpoint: (checkpoint: Parameters<typeof persistGenerationSession>[1]) => {
      persistGenerationSession(input.setup, checkpoint, 'running')
    },
  }

  if (runOptions.recovery === 'resume') {
    const session = getRecoverableGenerationSession(input.setup)

    if (session) {
      return resumeGenerateStoryPipeline(pipelineInput, pipelineOptions, session)
    }
  }

  if (runOptions.recovery === 'retry') {
    const session = getRecoverableGenerationSession(input.setup)

    if (session) {
      return retryGenerateStoryPipelineStep(
        pipelineInput,
        pipelineOptions,
        session,
        runOptions.retryStage,
      )
    }
  }

  const sessionId = createGenerationSessionId()

  return runGenerateStoryPipeline(pipelineInput, {
    ...pipelineOptions,
    recovery: {
      sessionId,
      checkpoint: buildRecoveryCheckpoint(sessionId, {
        storyCore: null,
        flashcards: [],
        imagePrompts: [],
        progress: createGenerationProgress(),
        errors: [],
        failedStage: null,
      }),
      mode: 'fresh',
    },
  })
}

function persistPipelineRecoveryState(
  input: StoryGenerationInput,
  result: GenerationPipelineResult,
  interrupted = false,
): void {
  const existing = readPersistedGenerationSession()
  const sessionId = existing?.sessionId ?? createGenerationSessionId()

  persistGenerationSession(
    input.setup,
    buildRecoveryCheckpointFromResult(sessionId, result),
    mapPipelineStatusToSessionStatus(result, interrupted),
    existing,
  )
}

function finalizePipelineResult(
  input: StoryGenerationInput,
  result: GenerationPipelineResult,
  interrupted = false,
): GeneratedStoryOutput {
  notifyGenerationRunComplete(result)

  if (result.status === 'success') {
    clearGenerationRecoverySession()
  } else {
    persistPipelineRecoveryState(input, result, interrupted)
  }

  if (!result.output) {
    const partialOutput = toPartialAIGenerationOutput(result)

    if (result.errors.some((error) => error.code === 'ABORTED')) {
      wrapProviderFailure(new GenerationAbortedError(), partialOutput)
    }

    wrapProviderFailure(
      new Error(result.errors[0]?.message ?? 'Story generation failed.'),
      partialOutput,
    )
  }

  if (result.status === 'partial') {
    wrapProviderFailure(
      new Error(result.errors.map((error) => error.message).join('; ')),
      toPartialAIGenerationOutput(result),
    )
  }

  assertValidGeneratedStoryOutput(result.output)

  return result.output
}

async function runWithAdapter(
  input: StoryGenerationInput,
  adapter: AiGenerationAdapter,
  signal: AbortSignal,
  runOptions: RunStoryGenerationOptions = {},
): Promise<GeneratedStoryOutput> {
  throwIfAborted(signal)
  notifyGenerationRunStart()

  try {
    const result = await runPipelineWithRecovery(input, adapter, signal, runOptions)
    throwIfAborted(signal)
    return finalizePipelineResult(input, result)
  } catch (error) {
    if (isGenerationAbortedError(error)) {
      const session = getInterruptedGenerationSession(input.setup)

      if (session) {
        persistGenerationSession(
          input.setup,
          {
            sessionId: session.sessionId,
            storyCore: session.storyCore,
            flashcards: session.flashcards,
            imagePrompts: session.imagePrompts,
            progress: session.progress,
            errors: session.errors,
            failedStage: session.failedStage,
          },
          'interrupted',
          session,
        )
      }
    }

    throw error
  }
}

function toPartialAIGenerationOutput(
  result: Awaited<ReturnType<typeof runGenerateStoryPipeline>>,
): PartialAIGenerationOutput | null {
  if (!result.partial.story) {
    return null
  }

  const failedStage = result.errors[0]?.stage

  return {
    story: result.partial.story,
    flashcards: result.partial.flashcards,
    imagePrompts: result.partial.imagePrompts,
    stage: failedStage === 'imagePrompts' ? 'images' : 'story',
  }
}

async function generateWithOptionalAiFallback(
  input: StoryGenerationInput,
  adapter: AiGenerationAdapter,
  signal: AbortSignal,
  mode: GenerationMode,
  runOptions: RunStoryGenerationOptions = {},
): Promise<{ output: GeneratedStoryOutput; adapter: AiGenerationAdapter }> {
  if (mode !== GenerationMode.AI) {
    return {
      output: await runWithAdapter(input, adapter, signal, runOptions),
      adapter,
    }
  }

  try {
    return {
      output: await runWithAdapter(input, adapter, signal, runOptions),
      adapter,
    }
  } catch (error) {
    if (isGenerationAbortedError(error) || isGenerationRecoveryError(error)) {
      throw error
    }

    console.warn(
      '[Story Generation] AI adapter failed; using mock fallback.',
      error instanceof Error ? error.message : error,
    )

    const mockAdapter = getMockAiGenerationAdapter()

    return {
      output: await runWithAdapter(input, mockAdapter, signal, runOptions),
      adapter: mockAdapter,
    }
  }
}

async function executeStoryGeneration(
  input: StoryGenerationInput,
  signal: AbortSignal,
  runOptions: RunStoryGenerationOptions = {},
): Promise<GeneratedStoryOutput> {
  throwIfAborted(signal)

  const generationCheck = canGenerate()

  if (!generationCheck.allowed) {
    throw new Error(generationCheck.reason ?? 'Story generation is not allowed right now.')
  }

  const mode = getGenerationConfig().mode
  const adapter = await resolveAiGenerationAdapter()

  const { output, adapter: usedAdapter } = await withGenerationTimeout(
    (timeoutSignal) =>
      generateWithOptionalAiFallback(input, adapter, timeoutSignal, mode, runOptions),
    { parentSignal: signal },
  )

  recordGeneration({
    provider: resolveProviderKind(mode, usedAdapter),
    generationMode: mode,
    estimatedTokens: estimateTokenUsage(input, output),
    input,
    output,
  })

  productAnalytics.storyGenerated({
    pageCount: output.storyPages.length,
    totalWordCount: output.totalWordCount,
    source: 'create_flow',
    provider: resolveProviderKind(mode, usedAdapter),
  })

  return attachGenerationMetadata(output, input, resolveProviderKind(mode, usedAdapter), usedAdapter)
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

/** Resume a persisted generation session without restarting completed stages. */
export async function resumeStoryGeneration(
  input: StoryGenerationInput,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput> {
  return enqueueStoryGeneration(
    input,
    (jobInput, signal) => executeStoryGeneration(jobInput, signal, { recovery: 'resume' }),
    options,
  )
}

/** Retry the failed pipeline step and continue from that point. */
export async function retryFailedStoryGenerationStep(
  input: StoryGenerationInput,
  retryStage?: GenerationStage,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput> {
  return enqueueStoryGeneration(
    input,
    (jobInput, signal) =>
      executeStoryGeneration(jobInput, signal, { recovery: 'retry', retryStage }),
    options,
  )
}

/** Recover an interrupted generation session when one exists for the same setup. */
export async function recoverInterruptedStoryGeneration(
  input: StoryGenerationInput,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput | null> {
  const session = getInterruptedGenerationSession(input.setup)

  if (!session) {
    return null
  }

  return resumeStoryGeneration(input, options)
}

/** Read the recoverable persisted generation session for a setup, if any. */
export function getRecoverableStoryGenerationSession(
  input: StoryGenerationInput,
): PersistedGenerationSession | null {
  return getRecoverableGenerationSession(input.setup)
}

/** Clear the persisted generation recovery session. */
export function clearStoryGenerationRecoverySession(): void {
  clearGenerationRecoverySession()
}

/** Orchestrates story generation through the queue and active provider. UI should call this only. */
export async function generateStory(
  input: StoryGenerationInput,
  options?: EnqueueStoryGenerationOptions,
): Promise<GeneratedStoryOutput> {
  const interruptedSession = getInterruptedGenerationSession(input.setup)

  if (interruptedSession) {
    return resumeStoryGeneration(input, options)
  }

  return enqueueStoryGeneration(input, executeStoryGeneration, options)
}

export {
  GenerationRecoveryError,
  getPartialAIGenerationOutput,
  isGenerationRecoveryError,
} from '@/shared/ai/recovery'
