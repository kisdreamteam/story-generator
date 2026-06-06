export class AIProviderAbortedError extends Error {
  readonly name = 'AIProviderAbortedError'

  constructor(message = 'Story generation was cancelled.') {
    super(message)
  }
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new AIProviderAbortedError()
  }
}

export function isAIProviderAbortedError(error: unknown): error is AIProviderAbortedError {
  return error instanceof AIProviderAbortedError
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal)

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    function onAbort() {
      window.clearTimeout(timeoutId)
      reject(new AIProviderAbortedError())
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
