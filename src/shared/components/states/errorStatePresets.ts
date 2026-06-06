import type { ErrorStateProps } from '../ErrorState'
import {
  classifyStoryDeleteError,
  classifyStoryLoadError,
  invalidStoryIdPresentation,
  storyNotFoundPresentation,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'

export type AppErrorStateKind =
  | 'storage-load-failed'
  | 'storage-save-failed'
  | 'storage-delete-failed'
  | 'story-not-found'
  | 'story-invalid-id'
  | 'migration-failed'
  | 'migration-partial'
  | 'network-error'
  | 'generic'

export interface AppErrorStatePresetOptions {
  signedIn?: boolean
  error?: unknown
  failedCount?: number
  copiedCount?: number
}

export interface AppErrorStatePreset {
  title: string
  description: string
  variant?: ErrorStateProps['variant']
  tone?: ErrorStateProps['tone']
}

export function getAppErrorStatePreset(
  kind: AppErrorStateKind,
  options: AppErrorStatePresetOptions = {},
): AppErrorStatePreset {
  switch (kind) {
    case 'storage-load-failed':
      return {
        title: 'Could not load your stories',
        description:
          'Something went wrong while reading your library. Your stories are still saved — try again.',
        variant: 'panel',
        tone: 'error',
      }

    case 'storage-save-failed': {
      const copy = options.error
        ? classifyStoryLoadError(options.error)
        : {
            title: 'Could not save story',
            description: 'Your edits are still on screen. Check your connection and try saving again.',
          }
      return { ...copy, variant: 'inline', tone: 'error' }
    }

    case 'storage-delete-failed': {
      const copy = options.error
        ? classifyStoryDeleteError(options.error)
        : {
            title: 'Could not delete story',
            description: 'Try again from Your stories.',
          }
      return { ...copy, variant: 'inline', tone: 'error' }
    }

    case 'story-not-found': {
      const copy = storyNotFoundPresentation({ signedIn: options.signedIn })
      return { ...copy, variant: 'panel', tone: 'error' }
    }

    case 'story-invalid-id': {
      const copy = invalidStoryIdPresentation()
      return { ...copy, variant: 'panel', tone: 'error' }
    }

    case 'migration-failed':
      return {
        title: 'Could not copy your stories',
        description: 'Check your connection, sign in if needed, and try again.',
        variant: 'inline',
        tone: 'error',
      }

    case 'migration-partial':
      return {
        title: 'Some stories could not be copied',
        description:
          options.copiedCount && options.copiedCount > 0
            ? `${options.copiedCount} ${options.copiedCount === 1 ? 'story was' : 'stories were'} copied. ${options.failedCount ?? 0} still need attention.`
            : 'None of your stories could be copied to your account.',
        variant: 'inline',
        tone: 'warning',
      }

    case 'network-error':
      return {
        title: 'Connection problem',
        description: 'Check your internet connection and try again.',
        variant: 'inline',
        tone: 'error',
      }

    case 'generic':
    default:
      return {
        title: 'Something went wrong',
        description: 'Please try again. If the problem continues, refresh the page.',
        variant: 'panel',
        tone: 'error',
      }
  }
}

/** Map a load guard presentation or thrown error to a preset kind. */
export function resolveStoryLoadErrorKind(
  status: 'invalid-id' | 'not-found' | 'error',
): AppErrorStateKind {
  if (status === 'invalid-id') return 'story-invalid-id'
  if (status === 'not-found') return 'story-not-found'
  return 'storage-load-failed'
}

export function presentationToErrorPreset(
  presentation: StoryLoadErrorPresentation,
): AppErrorStatePreset {
  return {
    title: presentation.title,
    description: presentation.description,
    variant: 'panel',
    tone: 'error',
  }
}
