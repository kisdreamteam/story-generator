import { createGenerationAbortController } from './generationAbort'
import type { StoryGenerationInput } from '../types'

export interface GenerationSession {
  id: string
  inputKey: string
  abortController: AbortController
  signal: AbortSignal
  startedAt: string
}

export function buildGenerationInputKey(input: StoryGenerationInput): string {
  return JSON.stringify(input.setup)
}

export function createGenerationSession(input: StoryGenerationInput): GenerationSession {
  const abortController = createGenerationAbortController()

  return {
    id: crypto.randomUUID(),
    inputKey: buildGenerationInputKey(input),
    abortController,
    signal: abortController.signal,
    startedAt: new Date().toISOString(),
  }
}
