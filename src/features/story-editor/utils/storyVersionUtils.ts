import type {
  AppendStoryVersionResult,
  CreateStoryVersionOptions,
  RestoreStoryVersionResult,
  StoryVersionContent,
  StoryVersionEntry,
  StoryVersionHistory,
  StoryVersionReason,
  StoryVersionSummary,
} from '../types/storyVersion.types'
import { DEFAULT_STORY_VERSION_LIMIT } from '../types/storyVersion.types'
import { cloneEditableStory } from './cloneEditableStory'
import { normalizeEditableStory } from './applyStoryEditorMutations'
import { storyContentEqual } from './storyContentEqual'

const REASON_LABELS: Record<StoryVersionReason, string> = {
  'session-open': 'When you opened the editor',
  'before-page-edit': 'Before page edit',
  'before-restore': 'Before restore',
  'manual-checkpoint': 'Manual checkpoint',
}

export function createVersionId(): string {
  return `sv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Stable fingerprint for deduplicating identical snapshots. */
export function createStoryContentHash(content: StoryVersionContent): string {
  const normalized = normalizeEditableStory(content)
  const json = JSON.stringify(normalized)
  let hash = 0

  for (let i = 0; i < json.length; i += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(i)
    hash |= 0
  }

  return `v1-${Math.abs(hash).toString(36)}`
}

export function formatStoryVersionTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function buildStoryVersionLabel(
  reason: StoryVersionReason,
  createdAt: string,
  detail?: string,
): string {
  const time = formatStoryVersionTimestamp(createdAt)
  const base = REASON_LABELS[reason]

  if (detail?.trim()) {
    return `${base} · ${detail.trim()} · ${time}`
  }

  return `${base} · ${time}`
}

export function createStoryVersionHistory(
  storyId: string,
  options?: { maxVersions?: number },
): StoryVersionHistory {
  return {
    storyId,
    maxVersions: options?.maxVersions ?? DEFAULT_STORY_VERSION_LIMIT,
    versions: [],
  }
}

export function toVersionSummary(entry: StoryVersionEntry): StoryVersionSummary {
  return {
    id: entry.id,
    storyId: entry.storyId,
    createdAt: entry.createdAt,
    formattedCreatedAt: formatStoryVersionTimestamp(entry.createdAt),
    reason: entry.reason,
    label: entry.label,
  }
}

export function toVersionSummaries(history: StoryVersionHistory): StoryVersionSummary[] {
  return history.versions.map(toVersionSummary)
}

export function findStoryVersion(
  history: StoryVersionHistory,
  versionId: string,
): StoryVersionEntry | undefined {
  return history.versions.find((entry) => entry.id === versionId)
}

export function getLatestStoryVersion(
  history: StoryVersionHistory,
): StoryVersionEntry | undefined {
  return history.versions[0]
}

/** Skip append when content hash matches the newest version. */
export function appendStoryVersion(
  history: StoryVersionHistory,
  options: CreateStoryVersionOptions,
): AppendStoryVersionResult {
  const createdAt = options.createdAt ?? new Date().toISOString()
  const hash = createStoryContentHash(options.content)
  const latest = history.versions[0]

  if (latest?.contentHash === hash) {
    return { history, entry: null, skippedDuplicate: true }
  }

  const entry: StoryVersionEntry = {
    id: createVersionId(),
    storyId: history.storyId,
    createdAt,
    reason: options.reason,
    label: options.label ?? buildStoryVersionLabel(options.reason, createdAt),
    contentHash: hash,
    snapshot: cloneEditableStory(options.content),
  }

  const versions = [entry, ...history.versions].slice(0, history.maxVersions)

  return {
    history: { ...history, versions },
    entry,
    skippedDuplicate: false,
  }
}

/**
 * Capture a snapshot before a major edit (page save, restore, etc.).
 * Returns unchanged history when content matches the latest version.
 */
export function snapshotBeforeMajorEdit(
  history: StoryVersionHistory,
  content: StoryVersionContent,
  reason: StoryVersionReason,
  detail?: string,
): AppendStoryVersionResult {
  const createdAt = new Date().toISOString()

  return appendStoryVersion(history, {
    content,
    reason,
    createdAt,
    label: buildStoryVersionLabel(reason, createdAt, detail),
  })
}

/** Restore editable content from a version entry. Does not mutate history. */
export function restoreStoryVersion(
  history: StoryVersionHistory,
  versionId: string,
): RestoreStoryVersionResult | null {
  const entry = findStoryVersion(history, versionId)
  if (!entry) return null

  return {
    history,
    versionId,
    restoredContent: cloneEditableStory(entry.snapshot),
    summary: toVersionSummary(entry),
  }
}

/** True when restoring would change the current working copy. */
export function wouldRestoreChangeContent(
  current: StoryVersionContent,
  versionId: string,
  history: StoryVersionHistory,
): boolean {
  const entry = findStoryVersion(history, versionId)
  if (!entry) return false
  return !storyContentEqual(current, entry.snapshot)
}

/** Seed history with an opening snapshot when the editor session loads. */
export function seedStoryVersionHistory(
  history: StoryVersionHistory,
  content: StoryVersionContent,
): AppendStoryVersionResult {
  if (history.versions.length > 0) {
    return { history, entry: null, skippedDuplicate: true }
  }

  return appendStoryVersion(history, {
    content,
    reason: 'session-open',
    label: buildStoryVersionLabel('session-open', new Date().toISOString()),
  })
}

export { DEFAULT_STORY_VERSION_LIMIT }
