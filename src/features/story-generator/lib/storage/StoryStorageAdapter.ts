import type { GeneratedStory, StoryProject } from '../../types/story-generator.types'

export interface LoadDraftWithGeneratedStoryResult {
  draft: StoryProject
  generatedStory: GeneratedStory
}

/** Persistence boundary — localStorage today, Supabase later (sync). */
export interface StoryStorageAdapter {
  getStoryDraft(id: string): StoryProject | null
  getStoryDrafts(): StoryProject[]
  saveStoryDraft(project: StoryProject): void
  /** Persist edited generated content for an existing story. Preserves id, createdAt, and setup; bumps version and updatedAt. */
  updateStory(id: string, generatedStory: GeneratedStory): StoryProject | null
  deleteStoryDraft(id: string): void
  clearStoryDrafts(): void
  loadDraftWithGeneratedStory(id: string): LoadDraftWithGeneratedStoryResult | null
}

/** Async variant for Supabase — same methods, Promise-based. Inactive until story-storage switches adapter. */
export interface StoryStorageAdapterAsync {
  getStoryDraft(id: string): Promise<StoryProject | null>
  getStoryDrafts(): Promise<StoryProject[]>
  saveStoryDraft(project: StoryProject): Promise<StoryProject>
  /** Persist edited generated content for an existing story. Preserves id, createdAt, and setup. */
  updateStory(id: string, generatedStory: GeneratedStory): Promise<StoryProject>
  deleteStoryDraft(id: string): Promise<void>
  clearStoryDrafts(): Promise<void>
  loadDraftWithGeneratedStory(id: string): Promise<LoadDraftWithGeneratedStoryResult | null>
}
