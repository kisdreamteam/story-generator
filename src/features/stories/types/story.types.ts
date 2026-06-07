import type { StoryGenerationMetadata } from '@/shared/ai/metadata'
import type { StoryPageImageFields } from '@/features/story-images/types'
import type { StoryLifecycleStatus } from './storyLifecycle.types'

/** A single page of story text for classroom reading. */
export interface StoryPage extends StoryPageImageFields {
  pageNumber: number
  text: string
  wordCount: number
  teachingFocus: string
}

/** Vocabulary card tied to the story. */
export interface StoryFlashcard {
  word: string
  simpleDefinition: string
  exampleSentence: string
}

/** Illustration prompt for one story page. */
export interface StoryImagePrompt {
  pageNumber: number
  prompt: string
  continuityReminder: string
}

/** Teacher answers collected on the setup form, before generation. */
export interface StorySetupInput {
  storyPurpose: string
  storyTone: string
  theme: string
  setting: string
  vocabularyFocus: string
  lessonGoal: string
  mainEvents: string
  wordsToInclude: string
  wordsToAvoid: string
  pageCount: number
  notes: string
  ageRange: string
  language: string
  /** Named characters or cast notes for the story. */
  characters: string
}

/** Snapshot shown on the review step before the teacher confirms generation. */
export interface StoryPlanReview {
  setup: StorySetupInput
  /** ISO timestamp when the teacher opened review (optional until saved). */
  reviewedAt?: string
}

/** Complete generated story content returned after generation. */
export interface GeneratedStory {
  title: string
  summary: string
  storyPages: StoryPage[]
  flashcards: StoryFlashcard[]
  imagePrompts: StoryImagePrompt[]
  totalWordCount: number
  /** ISO timestamp when the story was generated. */
  generatedAt: string
}

export type { StoryGenerationMetadata } from '@/shared/ai/metadata'

/** A teacher's story project — metadata, setup, and optional generated output. */
export interface StoryProject {
  id: string
  title: string
  theme: string
  ageRange: string
  language: string
  pageCount: number
  lessonGoal: string
  vocabularyWords: string[]
  setting: string
  characters: string
  storyPages: StoryPage[]
  flashcards: StoryFlashcard[]
  imagePrompts: StoryImagePrompt[]
  /** ISO timestamp when the project was created. */
  createdAt: string
  /** ISO timestamp when the project was last updated. */
  updatedAt: string
  /** Monotonic content revision — incremented on each successful edit save. */
  version?: number
  /** Teacher setup preserved for edit and reopen. */
  setup?: StorySetupInput
  /** Latest plan review snapshot, if the teacher reached that step. */
  planReview?: StoryPlanReview
  /** Populated after successful generation. */
  generatedStory?: GeneratedStory
  /** How the story was generated — optional for legacy projects. */
  generationMetadata?: StoryGenerationMetadata
  /** Teacher lifecycle status — optional for legacy projects; derived when missing. */
  lifecycleStatus?: StoryLifecycleStatus
  /** When set, story is archived and hidden from the default library list. */
  archivedAt?: string | null
}
