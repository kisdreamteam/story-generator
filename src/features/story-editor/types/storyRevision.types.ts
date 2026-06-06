import type { GeneratedStory } from '@/features/stories/types'

/** Default cap on persisted revision snapshots per story. */
export const DEFAULT_STORY_REVISION_LIMIT = 10

/** One persisted snapshot of generated story content before a save. */
export interface StoryRevision {
  id: string
  storyId: string
  /** ISO timestamp when this revision was recorded. */
  revisionAt: string
  /** Draft `createdAt` preserved at snapshot time — never rewritten on restore. */
  storyCreatedAt: string
  /** Draft `updatedAt` preserved at snapshot time — reflects last save before this revision. */
  storyUpdatedAt: string
  /** Content fingerprint — skip duplicate consecutive snapshots. */
  contentHash: string
  /** Teacher-facing list label. */
  label: string
  snapshot: GeneratedStory
}

/** Persisted revision stack for one story — newest first. */
export interface StoryRevisionHistory {
  storyId: string
  maxRevisions: number
  revisions: StoryRevision[]
}

/** List row for revision pickers — no snapshot payload. */
export interface StoryRevisionSummary {
  id: string
  storyId: string
  revisionAt: string
  formattedRevisionAt: string
  storyCreatedAt: string
  storyUpdatedAt: string
  label: string
}

export interface AppendStoryRevisionOptions {
  snapshot: GeneratedStory
  storyCreatedAt: string
  storyUpdatedAt: string
  revisionAt?: string
  label?: string
}

export interface AppendStoryRevisionResult {
  history: StoryRevisionHistory
  revision: StoryRevision | null
  skippedDuplicate: boolean
}

export interface RestoreStoryRevisionResult {
  history: StoryRevisionHistory
  revisionId: string
  restoredContent: GeneratedStory
  summary: StoryRevisionSummary
}

/** Persistence boundary — localStorage today; cloud sidecar optional later. */
export interface StoryRevisionStore {
  load(storyId: string): Promise<StoryRevisionHistory | null>
  save(history: StoryRevisionHistory): Promise<void>
  deleteForStory(storyId: string): Promise<void>
}
