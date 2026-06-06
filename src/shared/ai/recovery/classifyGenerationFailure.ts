import { isGenerationJobBusyError } from '../jobs'
import { isAIProviderAbortedError } from '../runtime/aiProviderAbort'
import { GenerationFailureKind, type GenerationFailureInfo } from './generationFailure.types'
import { isGenerationRecoveryError } from './GenerationRecoveryError'
import { isGenerationTimeoutError } from './generationTimeout'

function rawMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? '')
}

/** Map runtime errors to teacher-facing recovery metadata. */
export function classifyGenerationFailure(error: unknown): GenerationFailureInfo {
  const message = rawMessage(error)

  if (isAIProviderAbortedError(error) || /abort|cancel/i.test(message)) {
    return {
      kind: GenerationFailureKind.CANCELLED,
      message: 'Story creation was cancelled. Your story plan is still here.',
      retryable: true,
      hasPartialContent: isGenerationRecoveryError(error) && Boolean(error.partialOutput),
    }
  }

  if (isGenerationTimeoutError(error) || /timeout|timed out/i.test(message)) {
    return {
      kind: GenerationFailureKind.TIMEOUT,
      message: 'Story creation took too long. Try again in a moment.',
      retryable: true,
      hasPartialContent: isGenerationRecoveryError(error) && Boolean(error.partialOutput),
    }
  }

  if (isGenerationJobBusyError(error)) {
    return {
      kind: GenerationFailureKind.BUSY,
      message: 'Story creation is already running. Wait for it to finish or cancel it first.',
      retryable: false,
      hasPartialContent: false,
    }
  }

  if (/limit reached|today'?s limit/i.test(message)) {
    return {
      kind: GenerationFailureKind.LIMIT,
      message: 'You have reached today\'s limit for creating stories. Try again tomorrow.',
      retryable: false,
      hasPartialContent: false,
    }
  }

  if (/validation|must be|failed validation/i.test(message)) {
    return {
      kind: GenerationFailureKind.VALIDATION,
      message: 'We could not finish creating your story. Try again, or simplify your plan.',
      retryable: true,
      hasPartialContent: isGenerationRecoveryError(error) && Boolean(error.partialOutput),
    }
  }

  if (isGenerationRecoveryError(error)) {
    return {
      kind: GenerationFailureKind.PROVIDER,
      message: error.partialOutput
        ? 'We saved the story text we finished so far. You can retry for the missing pieces or save this draft.'
        : 'Story creation hit a problem. Your story plan is still here — try again.',
      retryable: true,
      hasPartialContent: Boolean(error.partialOutput),
    }
  }

  if (/openai|api key|vite_/i.test(message)) {
    return {
      kind: GenerationFailureKind.PROVIDER,
      message: 'Story creation is temporarily unavailable. Save your plan and try again later.',
      retryable: true,
      hasPartialContent: false,
    }
  }

  if (/network|fetch|connection|failed to fetch/i.test(message)) {
    return {
      kind: GenerationFailureKind.NETWORK,
      message: 'Check your internet connection and try again.',
      retryable: true,
      hasPartialContent: isGenerationRecoveryError(error) && Boolean(error.partialOutput),
    }
  }

  return {
    kind: GenerationFailureKind.UNKNOWN,
    message: 'We could not create your story right now. Save your plan and try again.',
    retryable: true,
    hasPartialContent: isGenerationRecoveryError(error) && Boolean(error.partialOutput),
  }
}

/** Teacher-facing one-line message for toasts and inline UI. */
export function formatGenerationFailureMessage(error: unknown): string {
  return classifyGenerationFailure(error).message
}
