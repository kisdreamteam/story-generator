import type { GeneratedStory } from '@/features/stories/types'
import type {
  AppendStoryRevisionOptions,
  AppendStoryRevisionResult,
  RestoreStoryRevisionResult,
  StoryRevision,
  StoryRevisionHistory,
  StoryRevisionSummary,
} from '../types/storyRevision.types'
import { DEFAULT_STORY_REVISION_LIMIT } from '../types/storyRevision.types'
import { cloneEditableStory } from './cloneEditableStory'
import { storyContentEqual } from './storyContentEqual'
import { createStoryContentHash, formatStoryVersionTimestamp } from './storyVersionUtils'

export function createRevisionId(): string {
  return `sr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createStoryRevisionHistory(
  storyId: string,
  options?: { maxRevisions?: number },
): StoryRevisionHistory {
  return {
    storyId,
    maxRevisions: options?.maxRevisions ?? DEFAULT_STORY_REVISION_LIMIT,
    revisions: [],
  }
}

/** Safe empty history when no revisions exist yet (older stories). */
export function normalizeStoryRevisionHistory(
  storyId: string,
  value: StoryRevisionHistory | null | undefined,
  options?: { maxRevisions?: number },
): StoryRevisionHistory {
  if (!value || value.storyId !== storyId || !Array.isArray(value.revisions)) {
    return createStoryRevisionHistory(storyId, options)
  }

  return {
    storyId,
    maxRevisions: value.maxRevisions ?? options?.maxRevisions ?? DEFAULT_STORY_REVISION_LIMIT,
    revisions: value.revisions.filter(
      (revision): revision is StoryRevision =>
        Boolean(revision?.id && revision.snapshot && revision.revisionAt),
    ),
  }
}

export function formatStoryRevisionTimestamp(iso: string): string {
  return formatStoryVersionTimestamp(iso)
}

export function buildStoryRevisionLabel(revisionAt: string, storyUpdatedAt: string): string {
  const savedAt = formatStoryRevisionTimestamp(storyUpdatedAt)
  const recordedAt = formatStoryRevisionTimestamp(revisionAt)
  return `Saved version · ${savedAt} · recorded ${recordedAt}`
}

export function toStoryRevisionSummary(revision: StoryRevision): StoryRevisionSummary {
  return {
    id: revision.id,
    storyId: revision.storyId,
    revisionAt: revision.revisionAt,
    formattedRevisionAt: formatStoryRevisionTimestamp(revision.revisionAt),
    storyCreatedAt: revision.storyCreatedAt,
    storyUpdatedAt: revision.storyUpdatedAt,
    label: revision.label,
  }
}

export function toStoryRevisionSummaries(history: StoryRevisionHistory): StoryRevisionSummary[] {
  return history.revisions.map(toStoryRevisionSummary)
}

export function findStoryRevision(
  history: StoryRevisionHistory,
  revisionId: string,
): StoryRevision | undefined {
  return history.revisions.find((revision) => revision.id === revisionId)
}

export function appendStoryRevision(
  history: StoryRevisionHistory,
  options: AppendStoryRevisionOptions,
): AppendStoryRevisionResult {
  const revisionAt = options.revisionAt ?? new Date().toISOString()
  const hash = createStoryContentHash(options.snapshot)
  const latest = history.revisions[0]

  if (latest?.contentHash === hash) {
    return { history, revision: null, skippedDuplicate: true }
  }

  const revision: StoryRevision = {
    id: createRevisionId(),
    storyId: history.storyId,
    revisionAt,
    storyCreatedAt: options.storyCreatedAt,
    storyUpdatedAt: options.storyUpdatedAt,
    contentHash: hash,
    label: options.label ?? buildStoryRevisionLabel(revisionAt, options.storyUpdatedAt),
    snapshot: cloneEditableStory(options.snapshot),
  }

  const revisions = [revision, ...history.revisions].slice(0, history.maxRevisions)

  return {
    history: { ...history, revisions },
    revision,
    skippedDuplicate: false,
  }
}

/** Record the current persisted story as a revision before overwriting on save. */
export function snapshotRevisionBeforeSave(
  history: StoryRevisionHistory,
  snapshot: AppendStoryRevisionOptions,
): AppendStoryRevisionResult {
  return appendStoryRevision(history, snapshot)
}

export function restoreStoryRevision(
  history: StoryRevisionHistory,
  revisionId: string,
): RestoreStoryRevisionResult | null {
  const revision = findStoryRevision(history, revisionId)
  if (!revision) return null

  return {
    history,
    revisionId,
    restoredContent: cloneEditableStory(revision.snapshot),
    summary: toStoryRevisionSummary(revision),
  }
}

export function wouldRestoreRevisionChangeContent(
  current: GeneratedStory,
  revisionId: string,
  history: StoryRevisionHistory,
): boolean {
  const revision = findStoryRevision(history, revisionId)
  if (!revision) return false
  return !storyContentEqual(current, revision.snapshot)
}

export { DEFAULT_STORY_REVISION_LIMIT }
