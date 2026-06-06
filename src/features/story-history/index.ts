export {
  appendStoryHistorySnapshotBeforeSave,
  deleteStoryHistory,
  loadStoryHistory,
  saveStoryHistory,
} from './api/storyHistoryApi'

export { StoryHistoryList, StoryHistoryPanel, StoryVersionCompare } from './components'
export type {
  StoryHistoryListProps,
  StoryHistoryPanelProps,
  StoryVersionCompareProps,
} from './components'

export { useStoryHistory } from './hooks'
export type { UseStoryHistoryOptions, UseStoryHistoryResult } from './hooks'

export {
  appendStoryHistoryEntry,
  buildStoryHistoryLabel,
  compareStoryHistoryEntries,
  compareStoryHistoryEntryToCurrent,
  createStoryHistory,
  findStoryHistoryEntry,
  normalizeStoryHistory,
  restoreStoryHistoryEntry,
  snapshotStoryHistoryBeforeSave,
  toStoryHistorySummaries,
  toStoryHistorySummary,
  wouldRestoreStoryHistoryChangeContent,
} from './lib/storyHistoryUtils'

export {
  cloneStoryHistorySnapshot,
  createStoryHistoryContentHash,
  formatStoryHistoryTimestamp,
  storyHistoryContentEqual,
} from './lib/storyHistoryHash'

export {
  getStoryHistoryStore,
  localStoryHistoryStore,
  resolveStoryHistoryStore,
  setStoryHistoryStore,
} from './storage/resolveStoryHistoryStore'

export {
  createCloudStoryHistoryStore,
  LEGACY_STORY_REVISIONS_STORAGE_KEY,
  STORY_HISTORY_STORAGE_KEY,
} from './storage/localStoryHistoryStore'

export type {
  AppendStoryHistoryOptions,
  AppendStoryHistoryResult,
  RestoreStoryHistoryResult,
  StoryHistory,
  StoryHistoryEntry,
  StoryHistoryStore,
  StoryHistorySummary,
  StoryVersionComparison,
} from './types/storyHistory.types'

export { DEFAULT_STORY_HISTORY_LIMIT } from './types/storyHistory.types'

/** Scroll target for the editor history panel. */
export const STORY_HISTORY_ELEMENT_ID = 'story-history'
