import {
  mapAIFlashcardsToGenerated,
  mapAIImagePromptsToGenerated,
  mapAIResultToGeneratedStoryOutput,
} from '@/features/story-generator/lib/generation/adapters/aiStoryOutputMapping'
import type { GeneratedStoryOutput } from '@/features/story-generator/lib/generation/types'
import {
  invokeStoryGenerationApi,
  isStoryGenerationApiAborted,
  type StoryCoreResponse,
  type StoryGenerationRequest,
} from './api/storyGenerationApi'
import {
  buildRecoveryCheckpoint,
  createGenerationSessionId,
  shouldExecuteGenerationStage,
} from './generationRecovery'
import {
  completeGenerationStage,
  createGenerationProgress,
  failGenerationStage,
  notifyGenerationProgress,
  skipGenerationStage,
  startGenerationStage,
} from './generationProgress'
import type {
  GenerationPipelineInput,
  GenerationPipelinePartial,
  GenerationPipelineResult,
  GenerationRecoveryCheckpoint,
  GenerationStageError,
  RunGenerateStoryPipelineOptions,
} from './generationTypes'

function toGenerationRequest(input: GenerationPipelineInput): StoryGenerationRequest {
  return { setup: input.setup }
}

function createStageError(
  stage: GenerationStageError['stage'],
  code: GenerationStageError['code'],
  message: string,
  recoverable: boolean,
): GenerationStageError {
  return { stage, code, message, recoverable }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function buildPartialOutput(
  story: GeneratedStoryOutput | null,
  flashcards: GeneratedStoryOutput['flashcards'],
  imagePrompts: GeneratedStoryOutput['imagePrompts'],
): GenerationPipelinePartial {
  if (!story) {
    return {
      story: null,
      flashcards: [],
      imagePrompts: [],
    }
  }

  return {
    story: {
      title: story.title,
      summary: story.summary,
      storyPages: story.storyPages,
      totalWordCount: story.totalWordCount,
      generatedAt: story.generatedAt,
    },
    flashcards,
    imagePrompts,
  }
}

function resolvePipelineStatus(
  errors: GenerationStageError[],
  output: GeneratedStoryOutput | null,
): GenerationPipelineResult['status'] {
  if (!output) {
    return 'failed'
  }

  if (errors.length === 0) {
    return 'success'
  }

  return 'partial'
}

/**
 * Orchestrates story generation in fixed stage order:
 * validate → story → flashcards → image prompts → combine.
 *
 * Optional stages record recoverable errors and continue when story text exists.
 * Recovery checkpoints skip completed stages on resume and restart from a failed step on retry.
 */
export async function runGenerateStoryPipeline(
  input: GenerationPipelineInput,
  options: RunGenerateStoryPipelineOptions,
): Promise<GenerationPipelineResult> {
  const { adapter, recovery } = options
  const request = toGenerationRequest(input)
  const requestOptions = {
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  }
  const sessionId = recovery?.sessionId ?? createGenerationSessionId()

  let progress = recovery?.checkpoint.progress ?? createGenerationProgress()
  let storyCore: StoryCoreResponse | null = recovery?.checkpoint.storyCore ?? null
  let flashcards = [...(recovery?.checkpoint.flashcards ?? [])]
  let imagePrompts = [...(recovery?.checkpoint.imagePrompts ?? [])]
  const errors: GenerationStageError[] =
    recovery?.mode === 'retry'
      ? [...recovery.checkpoint.errors]
      : [...(recovery?.checkpoint.errors ?? [])]

  const emitCheckpoint = (failedStage: GenerationStageError['stage'] | null) => {
    const checkpoint: GenerationRecoveryCheckpoint = buildRecoveryCheckpoint(sessionId, {
      storyCore,
      flashcards,
      imagePrompts,
      progress,
      errors,
      failedStage,
    })

    options.onCheckpoint?.(checkpoint)
  }

  const shouldRun = (stage: GenerationStageError['stage']) =>
    shouldExecuteGenerationStage(stage, recovery)

  progress = notifyGenerationProgress(progress, options.onProgress)

  if (shouldRun('validate')) {
    progress = notifyGenerationProgress(
      startGenerationStage(progress, 'validate'),
      options.onProgress,
    )

    const validation = adapter.validate(request)

    if (!validation.isValid) {
      progress = notifyGenerationProgress(
        failGenerationStage(progress, 'validate'),
        options.onProgress,
      )
      emitCheckpoint('validate')

      return {
        status: 'failed',
        output: null,
        partial: buildPartialOutput(null, [], []),
        errors: [
          createStageError(
            'validate',
            'VALIDATION_FAILED',
            validation.errors.join('; ') || 'Story setup failed validation.',
            false,
          ),
        ],
        progress,
      }
    }

    progress = notifyGenerationProgress(
      completeGenerationStage(progress, 'validate'),
      options.onProgress,
    )
    emitCheckpoint(null)
  } else {
    progress = notifyGenerationProgress(
      skipGenerationStage(progress, 'validate'),
      options.onProgress,
    )
  }

  if (shouldRun('story')) {
    progress = notifyGenerationProgress(startGenerationStage(progress, 'story'), options.onProgress)

    try {
      storyCore = await invokeStoryGenerationApi(
        (invokeOptions) => adapter.generateStory(request, invokeOptions),
        requestOptions,
      )
      progress = notifyGenerationProgress(
        completeGenerationStage(progress, 'story'),
        options.onProgress,
      )
      emitCheckpoint(null)
    } catch (error) {
      progress = notifyGenerationProgress(failGenerationStage(progress, 'story'), options.onProgress)
      const stageErrors = [
        createStageError(
          'story',
          isStoryGenerationApiAborted(error) ? 'ABORTED' : 'STORY_FAILED',
          errorMessage(error, 'Story generation failed.'),
          !isStoryGenerationApiAborted(error),
        ),
      ]
      emitCheckpoint('story')

      return {
        status: 'failed',
        output: null,
        partial: buildPartialOutput(null, [], []),
        errors: stageErrors,
        progress,
      }
    }
  } else if (storyCore) {
    progress = notifyGenerationProgress(skipGenerationStage(progress, 'story'), options.onProgress)
  } else {
    progress = notifyGenerationProgress(failGenerationStage(progress, 'story'), options.onProgress)
    emitCheckpoint('story')

    return {
      status: 'failed',
      output: null,
      partial: buildPartialOutput(null, [], []),
      errors: [
        createStageError(
          'story',
          'STORY_FAILED',
          'Story generation cannot resume without generated story text.',
          false,
        ),
      ],
      progress,
    }
  }

  if (shouldRun('flashcards')) {
    progress = notifyGenerationProgress(
      startGenerationStage(progress, 'flashcards'),
      options.onProgress,
    )

    try {
      flashcards = mapAIFlashcardsToGenerated(
        await invokeStoryGenerationApi(
          (invokeOptions) => adapter.generateFlashcards(request, storyCore!, invokeOptions),
          requestOptions,
        ),
      )
      progress = notifyGenerationProgress(
        completeGenerationStage(progress, 'flashcards'),
        options.onProgress,
      )
      emitCheckpoint(null)
    } catch (error) {
      progress = notifyGenerationProgress(
        failGenerationStage(progress, 'flashcards'),
        options.onProgress,
      )

      const stageError = createStageError(
        'flashcards',
        isStoryGenerationApiAborted(error) ? 'ABORTED' : 'FLASHCARDS_FAILED',
        errorMessage(error, 'Flashcard generation failed.'),
        !isStoryGenerationApiAborted(error),
      )
      errors.push(stageError)
      emitCheckpoint('flashcards')

      if (stageError.code === 'ABORTED') {
        const abortedOutput = mapAIResultToGeneratedStoryOutput(storyCore!, flashcards, imagePrompts)
        return {
          status: 'partial',
          output: abortedOutput,
          partial: buildPartialOutput(abortedOutput, flashcards, imagePrompts),
          errors,
          progress,
        }
      }
    }
  } else {
    progress = notifyGenerationProgress(
      skipGenerationStage(progress, 'flashcards'),
      options.onProgress,
    )
  }

  if (shouldRun('imagePrompts')) {
    progress = notifyGenerationProgress(
      startGenerationStage(progress, 'imagePrompts'),
      options.onProgress,
    )

    try {
      imagePrompts = mapAIImagePromptsToGenerated(
        await invokeStoryGenerationApi(
          (invokeOptions) => adapter.generateImagePrompts(request, storyCore!, invokeOptions),
          requestOptions,
        ),
      )
      progress = notifyGenerationProgress(
        completeGenerationStage(progress, 'imagePrompts'),
        options.onProgress,
      )
      emitCheckpoint(null)
    } catch (error) {
      progress = notifyGenerationProgress(
        failGenerationStage(progress, 'imagePrompts'),
        options.onProgress,
      )

      const stageError = createStageError(
        'imagePrompts',
        isStoryGenerationApiAborted(error) ? 'ABORTED' : 'IMAGE_PROMPTS_FAILED',
        errorMessage(error, 'Image prompt generation failed.'),
        !isStoryGenerationApiAborted(error),
      )
      errors.push(stageError)
      emitCheckpoint('imagePrompts')

      if (stageError.code === 'ABORTED') {
        const abortedOutput = mapAIResultToGeneratedStoryOutput(storyCore!, flashcards, imagePrompts)
        return {
          status: 'partial',
          output: abortedOutput,
          partial: buildPartialOutput(abortedOutput, flashcards, imagePrompts),
          errors,
          progress,
        }
      }
    }
  } else {
    progress = notifyGenerationProgress(
      skipGenerationStage(progress, 'imagePrompts'),
      options.onProgress,
    )
  }

  let output: GeneratedStoryOutput | null = null

  if (shouldRun('combine')) {
    progress = notifyGenerationProgress(startGenerationStage(progress, 'combine'), options.onProgress)

    try {
      output = mapAIResultToGeneratedStoryOutput(storyCore!, flashcards, imagePrompts)
      progress = notifyGenerationProgress(
        completeGenerationStage(progress, 'combine'),
        options.onProgress,
      )
      emitCheckpoint(null)
    } catch (error) {
      progress = notifyGenerationProgress(failGenerationStage(progress, 'combine'), options.onProgress)
      errors.push(
        createStageError(
          'combine',
          'COMBINE_FAILED',
          errorMessage(error, 'Could not combine generated story output.'),
          Boolean(storyCore),
        ),
      )
      emitCheckpoint('combine')
    }
  } else if (storyCore) {
    progress = notifyGenerationProgress(skipGenerationStage(progress, 'combine'), options.onProgress)
    output = mapAIResultToGeneratedStoryOutput(storyCore, flashcards, imagePrompts)
  }

  return {
    status: resolvePipelineStatus(errors, output),
    output,
    partial: buildPartialOutput(output, flashcards, imagePrompts),
    errors,
    progress,
  }
}
