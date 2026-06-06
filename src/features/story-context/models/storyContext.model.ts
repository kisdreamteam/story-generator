import type { StorySetupInput } from '@/features/stories/types'
import type {
  SeriesCharacterProfile,
  SeriesContinuityMode,
  SeriesRelationship,
} from '@/features/story-continuity'
import type { StoryMemory, VocabularyFrequencyEntry } from '@/features/story-memory'

/** Normalized teacher setup for generation context. */
export interface StoryContextSetup {
  storyPurpose: string
  storyTone: string
  theme: string
  setting: string
  vocabularyFocus: string
  lessonGoal: string
  mainEvents: string
  wordsToInclude: string[]
  wordsToAvoid: string[]
  pageCount: number
  notes: string
  ageRange: string
  language: string
  characters: string
}

/** Series continuity slice of the generation context. */
export interface StoryContextSeriesContinuity {
  mode: SeriesContinuityMode
  seriesId: string | null
  seriesName: string | null
  characters: SeriesCharacterProfile[]
  relationships: SeriesRelationship[]
  appearanceNotes: string[]
  recurringLocations: string[]
  recurringRules: string[]
  summary: string
}

export interface ThemeFrequencyEntry {
  theme: string
  count: number
  storyIds: string[]
}

export interface StoryContextPreviousStory {
  storyId: string
  title: string
  generatedAt: string
  charactersUsed: string[]
  locationsUsed: string[]
  themesUsed: string[]
  vocabularyUsed: string[]
}

export interface StoryContextVocabularyMemory {
  previouslyUsed: string[]
  frequency: VocabularyFrequencyEntry[]
  suggestedUnused: {
    targetWords: string[]
    optionalWords: string[]
    flashcardWords: string[]
    all: string[]
  }
}

export interface StoryContextThemeMemory {
  previouslyUsed: string[]
  frequency: ThemeFrequencyEntry[]
}

export interface StoryContextMemory {
  vocabulary: StoryContextVocabularyMemory
  themes: StoryContextThemeMemory
  previousStories: StoryContextPreviousStory[]
}

/** Single normalized context object for AI story generation. */
export interface StoryContext {
  setup: StoryContextSetup
  seriesContinuity: StoryContextSeriesContinuity
  memory: StoryContextMemory
  /** ISO timestamp when this context was assembled. */
  assembledAt: string
  /** Story id excluded from memory lookups, if any. */
  excludeStoryId?: string
}

export interface BuildStoryContextInput {
  setup: StorySetupInput
  continuity?: {
    mode?: SeriesContinuityMode
    seriesId?: string | null
  }
  /** Override stored story memories instead of reading local storage. */
  memories?: StoryMemory[]
  /** Omit a story when aggregating vocabulary, themes, and history. */
  excludeStoryId?: string
}

export interface BuildStoryContextMemoryOptions {
  setup: StorySetupInput
  memories?: StoryMemory[]
  excludeStoryId?: string
}
