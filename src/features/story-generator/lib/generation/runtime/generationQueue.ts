import type { GeneratedStoryOutput, StoryGenerationInput } from '../types'
import { abortGeneration, GenerationAbortedError } from './generationAbort'
import { buildGenerationInputKey, createGenerationSession, type GenerationSession } from './generationSession'

export class GenerationBusyError extends Error {
  constructor(message = 'Story generation is already in progress.') {
    super(message)
    this.name = 'GenerationBusyError'
  }
}

export function isGenerationBusyError(error: unknown): error is GenerationBusyError {
  return error instanceof GenerationBusyError
}

type GenerationRunner = (
  input: StoryGenerationInput,
  signal: AbortSignal,
) => Promise<GeneratedStoryOutput>

interface ActiveQueuedGeneration {
  session: GenerationSession
  promise: Promise<GeneratedStoryOutput>
}

let activeGeneration: ActiveQueuedGeneration | null = null

function clearActiveIfSession(sessionId: string): void {
  if (activeGeneration?.session.id === sessionId) {
    activeGeneration = null
  }
}

export interface EnqueueStoryGenerationOptions {
  /** Cancel the in-flight generation and start this one. */
  replace?: boolean
}

/**
 * Run one story generation at a time.
 * Duplicate requests for the same input reuse the active promise (anti-spam).
 */
export async function enqueueStoryGeneration(
  input: StoryGenerationInput,
  run: GenerationRunner,
  options: EnqueueStoryGenerationOptions = {},
): Promise<GeneratedStoryOutput> {
  const inputKey = buildGenerationInputKey(input)

  if (activeGeneration) {
    if (activeGeneration.session.inputKey === inputKey && !options.replace) {
      return activeGeneration.promise
    }

    if (!options.replace) {
      throw new GenerationBusyError()
    }

    cancelActiveStoryGeneration()
  }

  const session = createGenerationSession(input)

  const promise = run(input, session.signal)
    .then((output) => {
      if (session.signal.aborted) {
        throw new GenerationAbortedError()
      }

      return output
    })
    .finally(() => {
      clearActiveIfSession(session.id)
    })

  activeGeneration = { session, promise }
  return promise
}

export function cancelActiveStoryGeneration(): boolean {
  if (!activeGeneration) {
    return false
  }

  abortGeneration(activeGeneration.session.abortController)
  activeGeneration = null
  return true
}

export function isStoryGenerationActive(): boolean {
  return activeGeneration !== null
}

export function getActiveStoryGenerationSessionId(): string | null {
  return activeGeneration?.session.id ?? null
}

export function getActiveStoryGenerationInputKey(): string | null {
  return activeGeneration?.session.inputKey ?? null
}
