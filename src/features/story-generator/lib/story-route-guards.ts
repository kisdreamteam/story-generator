/** Route param validation and load-error messaging for story detail/edit pages. */

import { formatGenerationFailureMessage } from '@/shared/ai/recovery'

const STORY_ID_MAX_LENGTH = 128

/** Allowed story id characters (local draft-* ids and UUIDs). */
const STORY_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export type StoryGeneratedLoadStatus =
  | 'loading'
  | 'ready'
  | 'invalid-id'
  | 'not-found'
  | 'error'

export function isValidStoryRouteId(id: string | undefined): id is string {
  if (!id || !id.trim()) return false
  if (id.length > STORY_ID_MAX_LENGTH) return false
  return STORY_ID_PATTERN.test(id)
}

export interface StoryLoadErrorPresentation {
  title: string
  description: string
}

/** Map storage/auth failures to user-safe copy (no internal details). */
export function classifyStoryLoadError(error: unknown): StoryLoadErrorPresentation {
  const message = error instanceof Error ? error.message : ''

  if (/signed-in|sign in|auth/i.test(message)) {
    return {
      title: 'Sign in required',
      description: 'This story is saved to your account. Sign in from Settings to view or edit it.',
    }
  }

  if (/permission|policy|row-level|jwt|unauthorized|forbidden/i.test(message)) {
    return {
      title: 'Story unavailable',
      description: 'You do not have access to this story, or it may have been removed.',
    }
  }

  if (/network|fetch|failed to load/i.test(message)) {
    return {
      title: 'Could not load story',
      description: 'Check your connection and try again from the Stories page.',
    }
  }

  return {
    title: 'Could not load story',
    description: 'Something went wrong while loading this story. Try again from the Stories page.',
  }
}

/** Map storage/auth failures during delete to user-safe copy. */
export function classifyStoryDeleteError(error: unknown): StoryLoadErrorPresentation {
  const message = error instanceof Error ? error.message : ''

  if (/not found/i.test(message)) {
    return {
      title: 'Story not found',
      description:
        'This story may have already been deleted. You can return to your stories list and refresh.',
    }
  }

  if (/signed-in|sign in|auth/i.test(message)) {
    return {
      title: 'Sign in required',
      description: 'Sign in to delete stories saved to your account.',
    }
  }

  if (/permission|policy|row-level|jwt|unauthorized|forbidden/i.test(message)) {
    return {
      title: 'Could not delete story',
      description: 'You do not have permission to delete this story, or it may have been removed.',
    }
  }

  if (/network|fetch|failed to delete/i.test(message)) {
    return {
      title: 'Could not delete story',
      description: 'Check your connection and try again.',
    }
  }

  return {
    title: 'Could not delete story',
    description: 'Something went wrong while deleting this story. Try again from the Stories page.',
  }
}

export function storyNotFoundPresentation(options?: {
  signedIn?: boolean
}): StoryLoadErrorPresentation {
  if (options?.signedIn) {
    return {
      title: 'Story not found',
      description:
        'This story is not in your account. It may have been deleted or saved while you were signed out.',
    }
  }

  return {
    title: 'Story not found',
    description:
      'We could not find this story here. It may have been deleted or saved to your account instead.',
  }
}

export function invalidStoryIdPresentation(): StoryLoadErrorPresentation {
  return {
    title: 'Story link not recognized',
    description: 'Open the story again from Your stories.',
  }
}

/** Plain-language message for story generation failures — no internal details. */
export function formatTeacherFacingGenerationError(error: unknown): string {
  return formatGenerationFailureMessage(error)
}

/** Plain-language message when saving a story fails. */
export function formatTeacherFacingSaveError(error: unknown): string {
  return classifyStoryLoadError(error).description
}

/** Plain-language sign-in error — hides provider details. */
export function formatTeacherFacingAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '')

  if (/invalid login|invalid credentials|invalid email or password|invalid grant/i.test(message)) {
    return 'Email or password is incorrect. Try again.'
  }

  if (/already registered|already exists|user already/i.test(message)) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  if (/network|fetch|timeout|connection/i.test(message)) {
    return 'Could not connect. Check your internet and try again.'
  }

  if (/sign out/i.test(message)) {
    return 'Could not sign out. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}

/** Short reason when copying local stories to an account fails. */
export function formatTeacherFacingMigrationCopyFailure(error: string): string {
  if (/signed-in|sign in|auth/i.test(error)) {
    return 'Sign in required'
  }

  if (/network|fetch|timeout|connection/i.test(error)) {
    return 'Connection problem'
  }

  if (/supabase|postgres|policy|row-level|permission|jwt/i.test(error)) {
    return 'Could not save to your account'
  }

  return 'Could not copy'
}
