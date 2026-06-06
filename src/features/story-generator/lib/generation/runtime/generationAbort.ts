export class GenerationAbortedError extends Error {
  constructor(message = 'Story generation was cancelled.') {
    super(message)
    this.name = 'GenerationAbortedError'
  }
}

export function isGenerationAbortedError(error: unknown): error is GenerationAbortedError {
  return error instanceof GenerationAbortedError
}

export function createGenerationAbortController(): AbortController {
  return new AbortController()
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new GenerationAbortedError()
  }
}

export function abortGeneration(controller: AbortController, reason?: string): void {
  if (!controller.signal.aborted) {
    controller.abort(reason)
  }
}

/** Reject when an abort signal fires — for racing long-running provider work. */
export function waitForAbort(signal: AbortSignal): Promise<never> {
  if (signal.aborted) {
    return Promise.reject(new GenerationAbortedError())
  }

  return new Promise((_, reject) => {
    signal.addEventListener(
      'abort',
      () => {
        reject(new GenerationAbortedError())
      },
      { once: true },
    )
  })
}
