import type { GeneratedStory } from '@/features/stories/types'

/** Default cap on persisted history entries per story — prevents storage explosion. */
export const DEFAULT_STORY_HISTORY_LIMIT = 10

/** One persisted snapshot of generated story content before a save. */
export interface StoryHistoryEntry {
  id: string
  storyId: string
  /** ISO timestamp when this version was recorded. */
  recordedAt: string
  /** Draft `createdAt` preserved at snapshot time. */
  storyCreatedAt: string
  /** Draft `updatedAt` preserved at snapshot time — last save before this version. */
  storyUpdatedAt: string
  /** Content fingerprint — skip duplicate consecutive snapshots. */
  contentHash: string
  /** Teacher-facing list label. */
  label: string
  snapshot: GeneratedStory
}

/** Persisted version stack for one story — newest first. */
export interface StoryHistory {
  storyId: string
  maxEntries: number
  entries: StoryHistoryEntry[]
}

/** List row for history pickers — no snapshot payload. */
export interface StoryHistorySummary {
  id: string
  storyId: string
  recordedAt: string
  formattedRecordedAt: string
  formattedStoryUpdatedAt: string
  storyCreatedAt: string
  storyUpdatedAt: string
  label: string
}

export interface AppendStoryHistoryOptions {
  snapshot: GeneratedStory
  storyCreatedAt: string
  storyUpdatedAt: string
  recordedAt?: string
  label?: string
}

export interface AppendStoryHistoryResult {
  history: StoryHistory
  entry: StoryHistoryEntry | null
  skippedDuplicate: boolean
}

export interface RestoreStoryHistoryResult {
  history: StoryHistory
  entryId: string
  restoredContent: GeneratedStory
  summary: StoryHistorySummary
}

export interface StoryVersionComparison {
  leftEntryId: string
  rightEntryId: string
  titleChanged: boolean
  summaryChanged: boolean
  pageCountDelta: number
  flashcardCountDelta: number
  promptCountDelta: number
  wordCountDelta: number
  changedPageNumbers: number[]
}

/** Persistence boundary — local and cloud adapters implement this contract. */
export interface StoryHistoryStore {
  load(storyId: string): Promise<StoryHistory | null>
  save(history: StoryHistory): Promise<void>
  deleteForStory(storyId: string): Promise<void>
}
