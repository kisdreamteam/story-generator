import type { StoryFlashcard, StoryImagePrompt, StoryPage } from '../../types'

export type { StoryFlashcard, StoryImagePrompt, StoryPage }

export interface StoryDetailField {
  label: string
  value: string
  multiline?: boolean
}

export interface StoryDetailSetupSection {
  title: string
  events?: string[]
  fields: StoryDetailField[]
}

export interface StoryHeaderProps {
  title: string
  statusLabel: string
  summary?: string
  pageCount: number
  totalWordCount: number
  /** When true, hides the read-only badge (e.g. edit mode or setup-only draft). */
  hideReadOnlyBadge?: boolean
}

export interface StoryMetadataProps {
  createdAtLabel: string
  updatedAtLabel: string
  theme: string
  pageCount: number
  setupSections?: StoryDetailSetupSection[]
  setupFields?: StoryDetailField[]
}

export interface StoryPagesProps {
  pages: StoryPage[]
}

export interface StoryFlashcardsProps {
  flashcards: StoryFlashcard[]
}

export interface StoryImagePromptsProps {
  imagePrompts: StoryImagePrompt[]
}
