/** How image generation is scoped for a job. */
import type { GenerationJobFailure, GenerationJobStatus } from '../../jobs/types/generationJob.types'

export const ImageGenerationMode = {
  SINGLE: 'single',
  BATCH: 'batch',
  /** Reserved for future multi-page collage layouts. */
  COLLAGE: 'collage',
} as const

export type ImageGenerationMode = (typeof ImageGenerationMode)[keyof typeof ImageGenerationMode]

/** Lifecycle for a persisted illustration asset. */
export const ImageAssetStatus = {
  PROMPT_ONLY: 'prompt_only',
  QUEUED: 'queued',
  RUNNING: 'running',
  GENERATED: 'generated',
  FAILED: 'failed',
} as const

export type ImageAssetStatus = (typeof ImageAssetStatus)[keyof typeof ImageAssetStatus]

export interface ImagePromptRecord {
  id: string
  storyId: string
  pageNumber: number
  prompt: string
  continuityReminder: string
  createdAt: string
  updatedAt: string
}

export interface ImageAssetMetadata {
  width?: number
  height?: number
  format?: string
  provider?: string
  model?: string | null
  generatedAt?: string
  /** Future collage layout identifier (e.g. grid-2x2). */
  collageLayout?: string
}

export interface ImageAssetRecord {
  id: string
  storyId: string
  pageNumber: number
  promptId: string
  status: ImageAssetStatus
  imageUrl: string | null
  metadata: ImageAssetMetadata
  failureMessage?: string
  createdAt: string
  updatedAt: string
}

export interface StoryImageGenerationRecord {
  storyId: string
  prompts: ImagePromptRecord[]
  assets: ImageAssetRecord[]
  updatedAt: string
}

export interface ImageGenerationJobInput {
  storyId: string
  mode: ImageGenerationMode
  pageNumbers: number[]
  prompts: ImagePromptRecord[]
  /** Optional collage layout hint when mode is collage. */
  collageLayout?: string
}

export interface ImageGenerationJobOutput {
  assets: ImageAssetRecord[]
}

/** Tracks one illustration generation attempt on the client. */
export interface ImageGenerationJob {
  id: string
  storyId: string
  mode: ImageGenerationMode
  status: GenerationJobStatus
  input: ImageGenerationJobInput
  inputKey: string
  output?: ImageGenerationJobOutput
  failure?: GenerationJobFailure
  attempt: number
  maxAttempts: number
  createdAt: string
  queuedAt?: string
  startedAt?: string
  completedAt?: string
}

export interface ImageGenerationProviderOptions {
  signal?: AbortSignal
}

export interface ImageGenerationRequestContext {
  storyId: string
  mode: ImageGenerationMode
  collageLayout?: string
}
