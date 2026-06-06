import type { StoryFlashcard, StorySetupInput } from '@/features/stories/types'
import type { StoryMemory } from './storyMemory.model'

/** How a vocabulary word entered the candidate pool. */
export type VocabularyCategory = 'target' | 'optional' | 'flashcard'

/** Teacher-provided vocabulary pool for a story (not yet filtered by history). */
export interface VocabularyCandidatePool {
  targetWords?: string[]
  optionalWords?: string[]
  flashcards?: Array<string | StoryFlashcard>
}

export interface VocabularyWordUsage {
  word: string
  storyIds: string[]
  /** ISO timestamp from the most recent story that used this word. */
  lastUsedAt: string | null
}

export interface PreviouslyUsedVocabularyResult {
  words: string[]
  usages: VocabularyWordUsage[]
}

export interface VocabularyFrequencyEntry {
  word: string
  /** Number of stories that included this word. */
  count: number
  storyIds: string[]
}

export interface VocabularyTrackingOptions {
  /** Story memories to read. Defaults to all stored memories. */
  memories?: StoryMemory[]
  /** Omit a story when checking reuse (e.g. the story being edited). */
  excludeStoryId?: string
}

export interface SuggestUnusedVocabularyOptions extends VocabularyTrackingOptions {
  /** Max suggestions returned per category. */
  limit?: number
}

export interface SuggestUnusedVocabularyResult {
  targetWords: string[]
  optionalWords: string[]
  flashcards: StoryFlashcard[]
  flashcardWords: string[]
  /** All unused words across categories, deduplicated. */
  all: string[]
}

/** Input for building a candidate pool from teacher setup. */
export interface BuildVocabularyCandidatePoolInput {
  setup: StorySetupInput
  optionalWords?: string[]
  flashcards?: Array<string | StoryFlashcard>
}
