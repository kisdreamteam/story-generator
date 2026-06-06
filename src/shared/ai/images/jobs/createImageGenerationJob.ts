import {
  GenerationJobStatus,
  type GenerationJobFailure,
} from '../../jobs/types/generationJob.types'
import {
  ImageGenerationMode,
  type ImageGenerationJob,
  type ImageGenerationJobInput,
  type ImageGenerationJobOutput,
} from '../types'
import { buildImageGenerationInputKey } from '../mappers/storyImagePromptMapping'

export function createImageGenerationJob(
  input: ImageGenerationJobInput,
  maxAttempts = 3,
): ImageGenerationJob {
  return {
    id: crypto.randomUUID(),
    storyId: input.storyId,
    mode: input.mode,
    status: GenerationJobStatus.IDLE,
    input,
    inputKey: buildImageGenerationInputKey({
      storyId: input.storyId,
      mode: input.mode,
      pageNumbers: input.pageNumbers,
    }),
    attempt: 1,
    maxAttempts,
    createdAt: new Date().toISOString(),
  }
}

export function markImageGenerationJobCompleted(
  job: ImageGenerationJob,
  output: ImageGenerationJobOutput,
): ImageGenerationJob {
  const now = new Date().toISOString()

  return {
    ...job,
    status: GenerationJobStatus.COMPLETED,
    output,
    failure: undefined,
    completedAt: now,
  }
}

export function markImageGenerationJobFailed(
  job: ImageGenerationJob,
  failure: GenerationJobFailure,
): ImageGenerationJob {
  const now = new Date().toISOString()

  return {
    ...job,
    status: GenerationJobStatus.FAILED,
    failure,
    output: undefined,
    completedAt: now,
  }
}

export function markImageGenerationJobRunning(job: ImageGenerationJob): ImageGenerationJob {
  const now = new Date().toISOString()

  return {
    ...job,
    status: GenerationJobStatus.RUNNING,
    startedAt: job.startedAt ?? now,
    queuedAt: job.queuedAt ?? now,
  }
}

export function markImageGenerationJobQueued(job: ImageGenerationJob): ImageGenerationJob {
  return {
    ...job,
    status: GenerationJobStatus.QUEUED,
    queuedAt: new Date().toISOString(),
  }
}

export function resolveImageGenerationModePageNumbers(
  mode: ImageGenerationMode,
  pageNumbers: number[],
): number[] {
  const sorted = [...pageNumbers].sort((left, right) => left - right)

  if (mode === ImageGenerationMode.SINGLE) {
    return sorted.slice(0, 1)
  }

  return sorted
}
