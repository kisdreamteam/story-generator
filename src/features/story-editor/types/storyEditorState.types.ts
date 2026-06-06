import type {
  StoryFlashcard,
  StoryImagePrompt,
  StoryPage,
} from '@/features/stories/types'

/** Story-level fields editable in the editor — separate from page payloads. */
export interface StoryEditorMetadata {
  title: string
  summary: string
  /** ISO timestamp when the story was generated. */
  generatedAt: string
  /** Derived from page text; recalculated on content mutations. */
  totalWordCount: number
}

/**
 * In-memory editor model — never written to storage adapters directly.
 * Convert to {@link GeneratedStory} via `convertEditorStateToGeneratedStory()` before persist or preview.
 */
export interface StoryEditorState {
  metadata: StoryEditorMetadata
  pages: StoryPage[]
  flashcards: StoryFlashcard[]
  imagePrompts: StoryImagePrompt[]
}
