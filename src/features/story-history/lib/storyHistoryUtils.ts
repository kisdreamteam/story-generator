import type { GeneratedStory } from '@/features/stories/types'
import type {
  AppendStoryHistoryOptions,
  AppendStoryHistoryResult,
  RestoreStoryHistoryResult,
  StoryHistory,
  StoryHistoryEntry,
  StoryHistorySummary,
  StoryVersionComparison,
} from '../types/storyHistory.types'
import { DEFAULT_STORY_HISTORY_LIMIT } from '../types/storyHistory.types'
import {
  cloneStoryHistorySnapshot,
  createStoryHistoryContentHash,
  createStoryHistoryEntryId,
  formatStoryHistoryTimestamp,
  storyHistoryContentEqual,
} from './storyHistoryHash'

export function createStoryHistory(
  storyId: string,
  options?: { maxEntries?: number },
): StoryHistory {
  return {
    storyId,
    maxEntries: options?.maxEntries ?? DEFAULT_STORY_HISTORY_LIMIT,
    entries: [],
  }
}

export function normalizeStoryHistory(
  storyId: string,
  value: StoryHistory | null | undefined,
  options?: { maxEntries?: number },
): StoryHistory {
  if (!value || value.storyId !== storyId || !Array.isArray(value.entries)) {
    return createStoryHistory(storyId, options)
  }

  const maxEntries = value.maxEntries ?? options?.maxEntries ?? DEFAULT_STORY_HISTORY_LIMIT

  return {
    storyId,
    maxEntries,
    entries: value.entries
      .filter(
        (entry): entry is StoryHistoryEntry =>
          Boolean(entry?.id && entry.snapshot && entry.recordedAt),
      )
      .slice(0, maxEntries),
  }
}

export function buildStoryHistoryLabel(recordedAt: string, storyUpdatedAt: string): string {
  const savedAt = formatStoryHistoryTimestamp(storyUpdatedAt)
  const recordedLabel = formatStoryHistoryTimestamp(recordedAt)
  return `Saved version · ${savedAt} · recorded ${recordedLabel}`
}

export function toStoryHistorySummary(entry: StoryHistoryEntry): StoryHistorySummary {
  return {
    id: entry.id,
    storyId: entry.storyId,
    recordedAt: entry.recordedAt,
    formattedRecordedAt: formatStoryHistoryTimestamp(entry.recordedAt),
    formattedStoryUpdatedAt: formatStoryHistoryTimestamp(entry.storyUpdatedAt),
    storyCreatedAt: entry.storyCreatedAt,
    storyUpdatedAt: entry.storyUpdatedAt,
    label: entry.label,
  }
}

export function toStoryHistorySummaries(history: StoryHistory): StoryHistorySummary[] {
  return history.entries.map(toStoryHistorySummary)
}

export function findStoryHistoryEntry(
  history: StoryHistory,
  entryId: string,
): StoryHistoryEntry | undefined {
  return history.entries.find((entry) => entry.id === entryId)
}

export function appendStoryHistoryEntry(
  history: StoryHistory,
  options: AppendStoryHistoryOptions,
): AppendStoryHistoryResult {
  const recordedAt = options.recordedAt ?? new Date().toISOString()
  const hash = createStoryHistoryContentHash(options.snapshot)
  const latest = history.entries[0]

  if (latest?.contentHash === hash) {
    return { history, entry: null, skippedDuplicate: true }
  }

  const entry: StoryHistoryEntry = {
    id: createStoryHistoryEntryId(),
    storyId: history.storyId,
    recordedAt,
    storyCreatedAt: options.storyCreatedAt,
    storyUpdatedAt: options.storyUpdatedAt,
    contentHash: hash,
    label: options.label ?? buildStoryHistoryLabel(recordedAt, options.storyUpdatedAt),
    snapshot: cloneStoryHistorySnapshot(options.snapshot),
  }

  const entries = [entry, ...history.entries].slice(0, history.maxEntries)

  return {
    history: { ...history, entries },
    entry,
    skippedDuplicate: false,
  }
}

export function snapshotStoryHistoryBeforeSave(
  history: StoryHistory,
  snapshot: AppendStoryHistoryOptions,
): AppendStoryHistoryResult {
  return appendStoryHistoryEntry(history, snapshot)
}

export function restoreStoryHistoryEntry(
  history: StoryHistory,
  entryId: string,
): RestoreStoryHistoryResult | null {
  const entry = findStoryHistoryEntry(history, entryId)
  if (!entry) return null

  return {
    history,
    entryId,
    restoredContent: cloneStoryHistorySnapshot(entry.snapshot),
    summary: toStoryHistorySummary(entry),
  }
}

export function wouldRestoreStoryHistoryChangeContent(
  current: GeneratedStory,
  entryId: string,
  history: StoryHistory,
): boolean {
  const entry = findStoryHistoryEntry(history, entryId)
  if (!entry) return false
  return !storyHistoryContentEqual(current, entry.snapshot)
}

export function compareStoryHistoryEntries(
  left: StoryHistoryEntry,
  right: StoryHistoryEntry,
): StoryVersionComparison {
  const leftPages = left.snapshot.storyPages
  const rightPages = right.snapshot.storyPages
  const changedPageNumbers: number[] = []

  const pageNumbers = new Set([
    ...leftPages.map((page) => page.pageNumber),
    ...rightPages.map((page) => page.pageNumber),
  ])

  for (const pageNumber of pageNumbers) {
    const leftPage = leftPages.find((page) => page.pageNumber === pageNumber)
    const rightPage = rightPages.find((page) => page.pageNumber === pageNumber)

    if (!leftPage || !rightPage || leftPage.text !== rightPage.text) {
      changedPageNumbers.push(pageNumber)
    }
  }

  return {
    leftEntryId: left.id,
    rightEntryId: right.id,
    titleChanged: left.snapshot.title !== right.snapshot.title,
    summaryChanged: left.snapshot.summary !== right.snapshot.summary,
    pageCountDelta: rightPages.length - leftPages.length,
    flashcardCountDelta: right.snapshot.flashcards.length - left.snapshot.flashcards.length,
    promptCountDelta: right.snapshot.imagePrompts.length - left.snapshot.imagePrompts.length,
    wordCountDelta: right.snapshot.totalWordCount - left.snapshot.totalWordCount,
    changedPageNumbers: changedPageNumbers.sort((a, b) => a - b),
  }
}

export function compareStoryHistoryEntryToCurrent(
  entry: StoryHistoryEntry,
  current: GeneratedStory,
): StoryVersionComparison {
  const currentAsEntry: StoryHistoryEntry = {
    ...entry,
    id: 'current',
    snapshot: current,
    contentHash: createStoryHistoryContentHash(current),
  }

  return compareStoryHistoryEntries(entry, currentAsEntry)
}

export { DEFAULT_STORY_HISTORY_LIMIT }
