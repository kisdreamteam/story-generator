/** Route param validation and load-error messaging for story detail/edit pages. */

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
      description:
        'This story is saved to your cloud account. Sign in from Settings to view or edit it.',
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

export function storyNotFoundPresentation(options?: {
  signedIn?: boolean
}): StoryLoadErrorPresentation {
  if (options?.signedIn) {
    return {
      title: 'Story not found',
      description:
        'This story is not in your account. It may have been deleted or saved on another device while signed out.',
    }
  }

  return {
    title: 'Story not found',
    description:
      'The story could not be loaded on this device. It may have been deleted or saved while signed in to your account.',
  }
}

export function invalidStoryIdPresentation(): StoryLoadErrorPresentation {
  return {
    title: 'Invalid story link',
    description: 'The story address is not valid. Open the story from your Stories list.',
  }
}
