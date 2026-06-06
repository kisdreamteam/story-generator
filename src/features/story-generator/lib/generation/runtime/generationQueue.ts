import {
  createGenerationJobQueue,
  GenerationJobBusyError,
  isGenerationJobBusyError,
  type EnqueueGenerationJobOptions,
  type GenerationJob,
} from '@/shared/ai/jobs'
import type { GeneratedStoryOutput, StoryGenerationInput } from '../types'
import { buildGenerationInputKey } from './generationSession'

export { GenerationJobBusyError as GenerationBusyError, isGenerationJobBusyError as isGenerationBusyError }

export type EnqueueStoryGenerationOptions = EnqueueGenerationJobOptions

type StoryGenerationRunner = (
  input: StoryGenerationInput,
  signal: AbortSignal,
) => Promise<GeneratedStoryOutput>

const storyGenerationJobQueue = createGenerationJobQueue<StoryGenerationInput, GeneratedStoryOutput>()

/**
 * Run one story generation at a time.
 * Duplicate requests for the same input reuse the active promise (anti-spam).
 */
export async function enqueueStoryGeneration(
  input: StoryGenerationInput,
  run: StoryGenerationRunner,
  options: EnqueueStoryGenerationOptions = {},
): Promise<GeneratedStoryOutput> {
  return storyGenerationJobQueue.enqueue(
    input,
    buildGenerationInputKey(input),
    (jobInput, signal) => run(jobInput, signal),
    options,
  )
}

export function cancelActiveStoryGeneration(): boolean {
  return storyGenerationJobQueue.cancel()
}

export async function retryActiveStoryGeneration(): Promise<GeneratedStoryOutput> {
  return storyGenerationJobQueue.retry()
}

export async function retryStoryGeneration(jobId: string): Promise<GeneratedStoryOutput> {
  return storyGenerationJobQueue.retry(jobId)
}

export function isStoryGenerationActive(): boolean {
  return storyGenerationJobQueue.isActive()
}

export function getActiveStoryGenerationSessionId(): string | null {
  return storyGenerationJobQueue.getActiveJob()?.id ?? null
}

export function getActiveStoryGenerationInputKey(): string | null {
  return storyGenerationJobQueue.getActiveJob()?.inputKey ?? null
}

export function getActiveStoryGenerationJob(): GenerationJob<
  StoryGenerationInput,
  GeneratedStoryOutput
> | null {
  return storyGenerationJobQueue.getActiveJob()
}

export function getLastStoryGenerationJob(): GenerationJob<
  StoryGenerationInput,
  GeneratedStoryOutput
> | null {
  return storyGenerationJobQueue.getLastJob()
}

export function getStoryGenerationJobStatus() {
  return storyGenerationJobQueue.getStatus()
}

export function getStoryGenerationJobSnapshot() {
  return storyGenerationJobQueue.getSnapshot()
}

export function clearStoryGenerationJobs(): void {
  storyGenerationJobQueue.clear()
}
