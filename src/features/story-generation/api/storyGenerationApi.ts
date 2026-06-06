import type { StorySetupInput } from '@/features/stories/types'

/** Default per-request timeout for story generation API calls. */
export const DEFAULT_STORY_GENERATION_API_TIMEOUT_MS = 90_000

/** Teacher setup payload sent to the generation API boundary. */
export interface StoryGenerationRequest {
  setup: StorySetupInput
}

export interface StoryGenerationRequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export interface StoryPageResponse {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

export interface FlashcardResponse {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

export interface ImagePromptResponse {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Core story text returned from {@link StoryGenerationApi.generateStory}. */
export interface StoryCoreResponse {
  title: string
  summary: string
  storyPages: StoryPageResponse[]
  totalWordCount: number
  generatedAt: string
}

export interface StoryValidationResponse {
  isValid: boolean
  errors: string[]
}

export type StoryGenerationApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NETWORK'
  | 'PROVIDER'
  | 'UNKNOWN'

export class StoryGenerationApiError extends Error {
  readonly code: StoryGenerationApiErrorCode
  readonly cause?: unknown

  constructor(
    code: StoryGenerationApiErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message)
    this.name = 'StoryGenerationApiError'
    this.code = code
    this.cause = options?.cause
  }
}

export class StoryGenerationApiTimeoutError extends StoryGenerationApiError {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super('TIMEOUT', `Story generation request timed out after ${timeoutMs}ms.`)
    this.name = 'StoryGenerationApiTimeoutError'
    this.timeoutMs = timeoutMs
  }
}

export class StoryGenerationApiAbortedError extends StoryGenerationApiError {
  constructor(cause?: unknown) {
    super('ABORTED', 'Story generation request was cancelled.', { cause })
    this.name = 'StoryGenerationApiAbortedError'
  }
}

/**
 * Generation API contract — pipeline depends on this interface only.
 * Concrete providers are wired outside the pipeline.
 */
export interface StoryGenerationApi {
  validate(request: StoryGenerationRequest): StoryValidationResponse
  generateStory(
    request: StoryGenerationRequest,
    options?: StoryGenerationRequestOptions,
  ): Promise<StoryCoreResponse>
  generateFlashcards(
    request: StoryGenerationRequest,
    story: StoryCoreResponse,
    options?: StoryGenerationRequestOptions,
  ): Promise<FlashcardResponse[]>
  generateImagePrompts(
    request: StoryGenerationRequest,
    story: StoryCoreResponse,
    options?: StoryGenerationRequestOptions,
  ): Promise<ImagePromptResponse[]>
}

function linkAbortSignal(parent: AbortSignal | undefined, child: AbortController): void {
  if (!parent) {
    return
  }

  if (parent.aborted) {
    child.abort(parent.reason)
    return
  }

  parent.addEventListener('abort', () => child.abort(parent.reason), { once: true })
}

function isAbortError(error: unknown): boolean {
  if (error instanceof StoryGenerationApiAbortedError) {
    return true
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }

  return false
}

export function isStoryGenerationApiAborted(error: unknown): boolean {
  return (
    error instanceof StoryGenerationApiAbortedError ||
    (error instanceof StoryGenerationApiError && error.code === 'ABORTED') ||
    isAbortError(error)
  )
}

export function isStoryGenerationApiTimeout(error: unknown): error is StoryGenerationApiTimeoutError {
  return error instanceof StoryGenerationApiTimeoutError
}

/** Normalize provider, fetch, and abort failures into structured API errors. */
export function normalizeStoryGenerationApiError(error: unknown): StoryGenerationApiError {
  if (error instanceof StoryGenerationApiError) {
    return error
  }

  if (isAbortError(error)) {
    return new StoryGenerationApiAbortedError(error)
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return new StoryGenerationApiError('NETWORK', error.message, { cause: error })
  }

  if (error instanceof Error) {
    return new StoryGenerationApiError('PROVIDER', error.message, { cause: error })
  }

  return new StoryGenerationApiError('UNKNOWN', 'Story generation request failed.', { cause: error })
}

/** Run an API operation with request timeout and parent abort signal support. */
export async function withStoryGenerationTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: StoryGenerationRequestOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_STORY_GENERATION_API_TIMEOUT_MS
  const controller = new AbortController()

  linkAbortSignal(options.signal, controller)

  const timer = setTimeout(() => {
    controller.abort(new StoryGenerationApiTimeoutError(timeoutMs))
  }, timeoutMs)

  try {
    if (controller.signal.aborted) {
      throw normalizeStoryGenerationApiError(controller.signal.reason)
    }

    return await operation(controller.signal)
  } catch (error) {
    throw normalizeStoryGenerationApiError(error)
  } finally {
    clearTimeout(timer)
  }
}

/** Invoke a generation API method with timeout, abort, and normalized errors. */
export async function invokeStoryGenerationApi<T>(
  operation: (requestOptions: StoryGenerationRequestOptions) => Promise<T>,
  options: StoryGenerationRequestOptions = {},
): Promise<T> {
  return withStoryGenerationTimeout(async (signal) => {
    try {
      return await operation({ ...options, signal })
    } catch (error) {
      throw normalizeStoryGenerationApiError(error)
    }
  }, options)
}
