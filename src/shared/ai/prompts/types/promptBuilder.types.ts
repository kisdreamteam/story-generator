import type { SeriesContinuityMode, SeriesProfile } from '@/features/story-continuity'
import type { AIPromptContract } from '../../builders/buildAIPromptContract'

/** Optional vocabulary memory for continuity across stories in a series. */
export interface AIVocabularyMemoryContext {
  previouslyUsedWords?: string[]
  frequentlyUsedWords?: string[]
  suggestedUnusedWords?: string[]
}

export interface StoryPromptBuildOptions {
  continuityMode?: SeriesContinuityMode
  seriesId?: string | null
  /** When set, skips profile resolution from storage/catalog. */
  seriesProfile?: SeriesProfile | null
  vocabularyMemory?: AIVocabularyMemoryContext
}

export interface StoryPromptStrings {
  system: string
  user: string
}

export interface ImagePromptBuildInput {
  pageNumber: number
  pageText: string
  seriesName: string
  characterContinuityLines: string[]
  visualStyleNotes: string[]
  vocabularyCues?: string[]
}

export interface ImagePromptStrings {
  prompt: string
  continuityReminder: string
}

export interface ResolvedStoryPromptContext {
  contract: AIPromptContract
  seriesName: string
  seriesLines: string[]
  characterLines: string[]
  vocabularyLines: string[]
}
