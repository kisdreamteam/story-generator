const DEFAULT_GENERATION_TIMEOUT_MS = 120_000

export class GenerationTimeoutError extends Error {
  readonly name = 'GenerationTimeoutError'

  constructor(message = 'Story generation timed out.') {
    super(message)
  }
}

export function isGenerationTimeoutError(error: unknown): error is GenerationTimeoutError {
  return error instanceof GenerationTimeoutError
}

export function resolveGenerationTimeoutMs(): number {
  const raw = import.meta.env.VITE_GENERATION_TIMEOUT_MS?.trim()
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  return DEFAULT_GENERATION_TIMEOUT_MS
}

export interface WithGenerationTimeoutOptions {
  timeoutMs?: number
  parentSignal?: AbortSignal
}

/** Race provider work against a timeout — aborts the linked controller on timeout. */
export async function withGenerationTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  options: WithGenerationTimeoutOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? resolveGenerationTimeoutMs()
  const controller = new AbortController()
  const parentSignal = options.parentSignal

  if (parentSignal?.aborted) {
    controller.abort(parentSignal.reason)
  }

  function onParentAbort() {
    controller.abort(parentSignal?.reason)
  }

  parentSignal?.addEventListener('abort', onParentAbort, { once: true })

  const timeoutId = window.setTimeout(() => {
    controller.abort(new GenerationTimeoutError())
  }, timeoutMs)

  try {
    return await run(controller.signal)
  } catch (error) {
    if (controller.signal.aborted && controller.signal.reason instanceof GenerationTimeoutError) {
      throw controller.signal.reason
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
    parentSignal?.removeEventListener('abort', onParentAbort)
  }
}
