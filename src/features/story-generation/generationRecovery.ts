import type { StorySetupInput } from '@/features/stories/types'
import { runGenerateStoryPipeline } from './generateStoryPipeline'
import type {
  GenerationPipelineInput,
  GenerationPipelineResult,
  GenerationRecoveryCheckpoint,
  GenerationRecoveryMode,
  GenerationRecoveryOptions,
  GenerationStage,
  GenerationStageError,
  RunGenerateStoryPipelineOptions,
} from './generationTypes'
import { GENERATION_STAGE_ORDER, resetGenerationStagesFrom } from './generationProgress'
import {
  clearPersistedGenerationSession,
  isRecoverableGenerationSession,
  readPersistedGenerationSession,
  setupMatchesGenerationSession,
  writePersistedGenerationSession,
  type PersistedGenerationSession,
  type PersistedGenerationSessionStatus,
} from './generationSessionStorage'

export function createGenerationSessionId(): string {
  return crypto.randomUUID()
}

export function buildRecoveryCheckpoint(
  sessionId: string,
  partial: {
    storyCore: GenerationRecoveryCheckpoint['storyCore']
    flashcards: GenerationRecoveryCheckpoint['flashcards']
    imagePrompts: GenerationRecoveryCheckpoint['imagePrompts']
    progress: GenerationRecoveryCheckpoint['progress']
    errors: GenerationStageError[]
    failedStage: GenerationStage | null
  },
): GenerationRecoveryCheckpoint {
  return {
    sessionId,
    storyCore: partial.storyCore,
    flashcards: partial.flashcards,
    imagePrompts: partial.imagePrompts,
    progress: partial.progress,
    errors: partial.errors,
    failedStage: partial.failedStage,
  }
}

export function buildRecoveryCheckpointFromResult(
  sessionId: string,
  result: GenerationPipelineResult,
): GenerationRecoveryCheckpoint {
  return buildRecoveryCheckpoint(sessionId, {
    storyCore: result.partial.story,
    flashcards: result.partial.flashcards,
    imagePrompts: result.partial.imagePrompts,
    progress: result.progress,
    errors: result.errors,
    failedStage: result.errors[0]?.stage ?? null,
  })
}

export function checkpointFromPersistedSession(
  session: PersistedGenerationSession,
): GenerationRecoveryCheckpoint {
  return buildRecoveryCheckpoint(session.sessionId, {
    storyCore: session.storyCore,
    flashcards: session.flashcards,
    imagePrompts: session.imagePrompts,
    progress: session.progress,
    errors: session.errors,
    failedStage: session.failedStage,
  })
}

export function getRecoverableGenerationSession(
  setup?: StorySetupInput,
): PersistedGenerationSession | null {
  const session = readPersistedGenerationSession()

  if (!session || !isRecoverableGenerationSession(session)) {
    return null
  }

  if (setup && !setupMatchesGenerationSession(setup, session)) {
    return null
  }

  return session
}

export function getInterruptedGenerationSession(
  setup?: StorySetupInput,
): PersistedGenerationSession | null {
  const session = readPersistedGenerationSession()

  if (!session) {
    return null
  }

  if (setup && !setupMatchesGenerationSession(setup, session)) {
    return null
  }

  if (session.status !== 'running' && session.status !== 'interrupted') {
    return null
  }

  return session
}

export function persistGenerationSession(
  setup: StorySetupInput,
  checkpoint: GenerationRecoveryCheckpoint,
  status: PersistedGenerationSessionStatus,
  existing?: PersistedGenerationSession | null,
): PersistedGenerationSession {
  const now = new Date().toISOString()
  const session: PersistedGenerationSession = {
    version: 1,
    sessionId: checkpoint.sessionId,
    setup,
    status,
    progress: checkpoint.progress,
    storyCore: checkpoint.storyCore,
    flashcards: checkpoint.flashcards,
    imagePrompts: checkpoint.imagePrompts,
    errors: checkpoint.errors,
    failedStage: checkpoint.failedStage,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  writePersistedGenerationSession(session)
  return session
}

export function clearGenerationRecoverySession(): void {
  clearPersistedGenerationSession()
}

export function resolveRecoveryStage(session: PersistedGenerationSession): GenerationStage | null {
  if (session.failedStage) {
    return session.failedStage
  }

  return (
    GENERATION_STAGE_ORDER.find(
      (stage) =>
        session.progress.stages[stage] === 'running' ||
        session.progress.stages[stage] === 'failed' ||
        session.progress.stages[stage] === 'pending',
    ) ?? null
  )
}

export function shouldExecuteGenerationStage(
  stage: GenerationStage,
  recovery: GenerationRecoveryOptions | undefined,
): boolean {
  if (!recovery || recovery.mode === 'fresh') {
    return true
  }

  const stageIndex = GENERATION_STAGE_ORDER.indexOf(stage)

  if (recovery.mode === 'retry') {
    const retryStage = recovery.retryStage ?? recovery.checkpoint.failedStage

    if (!retryStage) {
      return true
    }

    return stageIndex >= GENERATION_STAGE_ORDER.indexOf(retryStage)
  }

  return recovery.checkpoint.progress.stages[stage] !== 'completed'
}

export function prepareRecoveryRetryState(
  checkpoint: GenerationRecoveryCheckpoint,
  retryStage: GenerationStage,
): GenerationRecoveryCheckpoint {
  const retryIndex = GENERATION_STAGE_ORDER.indexOf(retryStage)
  const downstreamStages = new Set(GENERATION_STAGE_ORDER.slice(retryIndex))

  if (retryStage === 'story') {
    return {
      ...checkpoint,
      storyCore: null,
      flashcards: [],
      imagePrompts: [],
      progress: resetGenerationStagesFrom(checkpoint.progress, 'story'),
      errors: checkpoint.errors.filter((error) => error.stage !== retryStage),
      failedStage: retryStage,
    }
  }

  return {
    ...checkpoint,
    flashcards: retryStage === 'flashcards' ? [] : checkpoint.flashcards,
    imagePrompts: retryStage === 'imagePrompts' ? [] : checkpoint.imagePrompts,
    progress: resetGenerationStagesFrom(checkpoint.progress, retryStage),
    errors: checkpoint.errors.filter((error) => !downstreamStages.has(error.stage)),
    failedStage: retryStage,
  }
}

export function createRecoveryOptions(
  session: PersistedGenerationSession,
  mode: GenerationRecoveryMode,
  retryStage?: GenerationStage,
): GenerationRecoveryOptions {
  return {
    sessionId: session.sessionId,
    checkpoint: checkpointFromPersistedSession(session),
    mode,
    retryStage,
  }
}

export async function resumeGenerateStoryPipeline(
  input: GenerationPipelineInput,
  options: RunGenerateStoryPipelineOptions,
  session: PersistedGenerationSession,
): Promise<GenerationPipelineResult> {
  return runGenerateStoryPipeline(input, {
    ...options,
    recovery: createRecoveryOptions(session, 'resume'),
  })
}

export async function retryGenerateStoryPipelineStep(
  input: GenerationPipelineInput,
  options: RunGenerateStoryPipelineOptions,
  session: PersistedGenerationSession,
  stage?: GenerationStage,
): Promise<GenerationPipelineResult> {
  const retryStage = stage ?? resolveRecoveryStage(session)

  if (!retryStage) {
    throw new Error('No failed generation step is available to retry.')
  }

  const checkpoint = prepareRecoveryRetryState(checkpointFromPersistedSession(session), retryStage)

  return runGenerateStoryPipeline(input, {
    ...options,
    recovery: {
      sessionId: session.sessionId,
      checkpoint,
      mode: 'retry',
      retryStage,
    },
  })
}

export async function recoverInterruptedGeneration(
  input: GenerationPipelineInput,
  options: RunGenerateStoryPipelineOptions,
  setup?: StorySetupInput,
): Promise<GenerationPipelineResult | null> {
  const session = getInterruptedGenerationSession(setup ?? input.setup)

  if (!session) {
    return null
  }

  return resumeGenerateStoryPipeline(input, options, session)
}

export function mapPipelineStatusToSessionStatus(
  result: GenerationPipelineResult,
  interrupted = false,
): PersistedGenerationSessionStatus {
  if (interrupted) {
    return 'interrupted'
  }

  if (result.status === 'success') {
    return 'running'
  }

  if (result.status === 'partial') {
    return 'partial'
  }

  return 'failed'
}

export type { AiGenerationAdapter } from './adapters/aiGenerationAdapter.types'
export type { StoryGenerationApi } from './api/storyGenerationApi'
