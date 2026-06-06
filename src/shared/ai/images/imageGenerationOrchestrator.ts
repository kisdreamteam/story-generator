import { createGenerationJobQueue } from '../jobs/queue/createGenerationJobQueue'
import { GenerationJobStatus } from '../jobs/types/generationJob.types'
import { throwIfAborted } from '../runtime/aiProviderAbort'
import {
  createImageGenerationJob,
  markImageGenerationJobQueued,
  resolveImageGenerationModePageNumbers,
} from './jobs/createImageGenerationJob'
import { buildImageGenerationInputKey } from './mappers/storyImagePromptMapping'
import { resolveImageGenerationModeHandler } from './providers/mockAIImageGenerationProvider'
import { resolveAIImageGenerationProvider } from './providers/getAIImageGenerationProvider'
import { upsertImageAssetRecords } from './storage/imagePromptPersistence'
import {
  ImageGenerationMode,
  type ImageGenerationJob,
  type ImageGenerationJobInput,
  type ImageGenerationJobOutput,
  type ImageGenerationProviderOptions,
} from './types'

const imageGenerationJobQueue = createGenerationJobQueue<
  ImageGenerationJobInput,
  ImageGenerationJobOutput
>()

function selectPromptsForJob(input: ImageGenerationJobInput): ImageGenerationJobInput['prompts'] {
  const pageNumbers = resolveImageGenerationModePageNumbers(input.mode, input.pageNumbers)
  const pageSet = new Set(pageNumbers)

  return input.prompts.filter((prompt) => pageSet.has(prompt.pageNumber))
}

async function runImageGenerationJob(
  input: ImageGenerationJobInput,
  signal: AbortSignal,
  options?: ImageGenerationProviderOptions,
): Promise<ImageGenerationJobOutput> {
  throwIfAborted(signal)

  const provider = await resolveAIImageGenerationProvider()
  const prompts = selectPromptsForJob(input)

  if (prompts.length === 0) {
    throw new Error('No image prompts are available for this generation job.')
  }

  const context = {
    storyId: input.storyId,
    mode: input.mode,
    collageLayout: input.collageLayout,
  }

  const handler = resolveImageGenerationModeHandler(provider, input.mode)
  let assets

  if (input.mode === ImageGenerationMode.SINGLE) {
    if (!handler.generateSingle) {
      throw new Error('Single image generation is not available for this provider.')
    }

    assets = [await handler.generateSingle(context, prompts[0], { ...options, signal })]
  } else if (input.mode === ImageGenerationMode.COLLAGE) {
    if (!handler.generateCollage) {
      throw new Error('Collage image generation is not available for this provider.')
    }

    assets = [await handler.generateCollage(context, prompts, { ...options, signal })]
  } else {
    if (!handler.generateBatch) {
      throw new Error('Batch image generation is not available for this provider.')
    }

    assets = await handler.generateBatch(context, prompts, { ...options, signal })
  }

  upsertImageAssetRecords(input.storyId, assets)

  return { assets }
}

/** Queue an image generation job — architecture entry point, no remote providers yet. */
export async function enqueueImageGenerationJob(
  input: ImageGenerationJobInput,
  options?: ImageGenerationProviderOptions,
): Promise<ImageGenerationJobOutput> {
  return imageGenerationJobQueue.enqueue(
    input,
    buildImageGenerationInputKey({
      storyId: input.storyId,
      mode: input.mode,
      pageNumbers: input.pageNumbers,
    }),
    (jobInput, signal) => runImageGenerationJob(jobInput, signal, options),
  )
}

export function cancelActiveImageGenerationJob(): boolean {
  return imageGenerationJobQueue.cancel()
}

export async function retryActiveImageGenerationJob(): Promise<ImageGenerationJobOutput> {
  return imageGenerationJobQueue.retry()
}

export function getActiveImageGenerationJob(): ImageGenerationJob | null {
  const job = imageGenerationJobQueue.getActiveJob()
  if (!job) return null

  return toImageGenerationJob(job)
}

export function getLastImageGenerationJob(): ImageGenerationJob | null {
  const job = imageGenerationJobQueue.getLastJob()
  if (!job) return null

  return toImageGenerationJob(job)
}

export function getImageGenerationJobStatus(): GenerationJobStatus {
  return imageGenerationJobQueue.getStatus()
}

export function buildImageGenerationJob(input: ImageGenerationJobInput): ImageGenerationJob {
  return markImageGenerationJobQueued(createImageGenerationJob(input))
}

function toImageGenerationJob(job: {
  id: string
  status: GenerationJobStatus
  input: ImageGenerationJobInput
  inputKey: string
  output?: ImageGenerationJobOutput
  failure?: { message: string; cancelled?: boolean }
  attempt: number
  maxAttempts: number
  createdAt: string
  queuedAt?: string
  startedAt?: string
  completedAt?: string
}): ImageGenerationJob {
  return {
    id: job.id,
    storyId: job.input.storyId,
    mode: job.input.mode,
    status: job.status,
    input: job.input,
    inputKey: job.inputKey,
    output: job.output,
    failure: job.failure,
    attempt: job.attempt,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    queuedAt: job.queuedAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  }
}
