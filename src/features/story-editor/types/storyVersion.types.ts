import type { GeneratedStory } from '@/features/stories/types'

/** Default cap on in-memory / persisted version entries per story. */
export const DEFAULT_STORY_VERSION_LIMIT = 10

/** Why a snapshot was captured — used for labels and major-edit detection. */
export type StoryVersionReason =
  | 'session-open'
  | 'before-page-edit'
  | 'before-restore'
  | 'manual-checkpoint'

/** Full generated-story payload stored in a version entry. */
export type StoryVersionContent = GeneratedStory

/** One point-in-time story snapshot. */
export interface StoryVersionEntry {
  id: string
  storyId: string
  /** ISO timestamp when the snapshot was created. */
  createdAt: string
  reason: StoryVersionReason
  /** Teacher-facing line shown in version lists. */
  label: string
  /** Content fingerprint — used to skip duplicate snapshots. */
  contentHash: string
  snapshot: StoryVersionContent
}

/** Lightweight list row — no snapshot payload (for pickers and timestamps). */
export interface StoryVersionSummary {
  id: string
  storyId: string
  createdAt: string
  formattedCreatedAt: string
  reason: StoryVersionReason
  label: string
}

/** In-memory or persisted version stack for one story. Storage adapters map to this shape. */
export interface StoryVersionHistory {
  storyId: string
  maxVersions: number
  /** Newest first. */
  versions: StoryVersionEntry[]
}

export interface CreateStoryVersionOptions {
  content: StoryVersionContent
  reason: StoryVersionReason
  createdAt?: string
  label?: string
}

export interface AppendStoryVersionResult {
  history: StoryVersionHistory
  entry: StoryVersionEntry | null
  skippedDuplicate: boolean
}

export interface RestoreStoryVersionResult {
  history: StoryVersionHistory
  versionId: string
  restoredContent: StoryVersionContent
  summary: StoryVersionSummary
}

/**
 * Optional persistence boundary — implement for localStorage, Supabase, etc.
 * Pure utils operate on `StoryVersionHistory` without calling this.
 */
export interface StoryVersionStore {
  load(storyId: string): Promise<StoryVersionHistory | null>
  save(history: StoryVersionHistory): Promise<void>
}
