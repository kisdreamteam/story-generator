import type { StorySetupInput } from '@/features/stories/types'
import type {
  GeneratedFlashcardOutput,
  GeneratedImagePromptOutput,
} from '@/features/story-generator/lib/generation/types'
import type { StoryCoreResponse } from './api/storyGenerationApi'
import type {
  GenerationProgress,
  GenerationStage,
  GenerationStageError,
} from './generationTypes'

export const GENERATION_SESSION_STORAGE_KEY = 'nina-nino:generation-session-v1'

export type PersistedGenerationSessionStatus = 'running' | 'partial' | 'failed' | 'interrupted'

export interface PersistedGenerationSession {
  version: 1
  sessionId: string
  setup: StorySetupInput
  status: PersistedGenerationSessionStatus
  progress: GenerationProgress
  storyCore: StoryCoreResponse | null
  flashcards: GeneratedFlashcardOutput[]
  imagePrompts: GeneratedImagePromptOutput[]
  errors: GenerationStageError[]
  failedStage: GenerationStage | null
  createdAt: string
  updatedAt: string
}

function isStorySetupInput(value: unknown): value is StorySetupInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  const setup = value as StorySetupInput
  return typeof setup.theme === 'string' && typeof setup.pageCount === 'number'
}

export function readPersistedGenerationSession(): PersistedGenerationSession | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(GENERATION_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as PersistedGenerationSession

    if (
      parsed?.version !== 1 ||
      !parsed.sessionId ||
      !parsed.updatedAt ||
      !isStorySetupInput(parsed.setup)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writePersistedGenerationSession(session: PersistedGenerationSession): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.setItem(GENERATION_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Ignore quota and access errors — recovery is best-effort.
  }
}

export function clearPersistedGenerationSession(): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(GENERATION_SESSION_STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export function isRecoverableGenerationSession(session: PersistedGenerationSession): boolean {
  if (session.status === 'running' || session.status === 'interrupted') {
    return Boolean(session.storyCore) || session.progress.stages.validate === 'completed'
  }

  if (session.status === 'partial' || session.status === 'failed') {
    return Boolean(session.failedStage) && session.errors.some((error) => error.recoverable)
  }

  return false
}

export function setupMatchesGenerationSession(
  setup: StorySetupInput,
  session: PersistedGenerationSession,
): boolean {
  return JSON.stringify(setup) === JSON.stringify(session.setup)
}
