import type { StoryHistory, StoryHistoryStore } from '../types/storyHistory.types'
import { normalizeStoryHistory } from '../lib/storyHistoryUtils'

export const STORY_HISTORY_STORAGE_KEY = 'story-history'
export const LEGACY_STORY_REVISIONS_STORAGE_KEY = 'story-revisions'

type StoryHistoryStoreMap = Record<string, StoryHistory>

function isStoryHistory(value: unknown): value is StoryHistory {
  if (!value || typeof value !== 'object') return false

  const history = value as StoryHistory
  return typeof history.storyId === 'string' && Array.isArray(history.entries)
}

/** Map legacy revision records into the story-history shape. */
function migrateLegacyRevisionHistory(raw: unknown): StoryHistory | null {
  if (!raw || typeof raw !== 'object') return null

  const legacy = raw as {
    storyId?: string
    maxRevisions?: number
    revisions?: Array<{
      id: string
      storyId: string
      revisionAt: string
      storyCreatedAt: string
      storyUpdatedAt: string
      contentHash: string
      label: string
      snapshot: StoryHistory['entries'][number]['snapshot']
    }>
  }

  if (!legacy.storyId || !Array.isArray(legacy.revisions)) return null

  return {
    storyId: legacy.storyId,
    maxEntries: legacy.maxRevisions ?? 10,
    entries: legacy.revisions.map((revision) => ({
      id: revision.id,
      storyId: revision.storyId,
      recordedAt: revision.revisionAt,
      storyCreatedAt: revision.storyCreatedAt,
      storyUpdatedAt: revision.storyUpdatedAt,
      contentHash: revision.contentHash,
      label: revision.label,
      snapshot: revision.snapshot,
    })),
  }
}

function readStoreMap(storageKey: string): StoryHistoryStoreMap {
  try {
    if (typeof localStorage === 'undefined') return {}

    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const map: StoryHistoryStoreMap = {}
    for (const [storyId, history] of Object.entries(parsed as Record<string, unknown>)) {
      if (isStoryHistory(history)) {
        map[storyId] = history
        continue
      }

      const migrated = migrateLegacyRevisionHistory(history)
      if (migrated) {
        map[storyId] = migrated
      }
    }

    return map
  } catch {
    return {}
  }
}

function writeStoreMap(storageKey: string, map: StoryHistoryStoreMap): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(storageKey, JSON.stringify(map))
  } catch {
    // History is best-effort and must not block saves.
  }
}

function createLocalStoryHistoryStore(storageKey: string): StoryHistoryStore {
  return {
    async load(storyId: string): Promise<StoryHistory | null> {
      if (!storyId) return null

      let map = readStoreMap(storageKey)
      let history = map[storyId]

      if (!history && storageKey === STORY_HISTORY_STORAGE_KEY) {
        const legacyMap = readStoreMap(LEGACY_STORY_REVISIONS_STORAGE_KEY)
        history = legacyMap[storyId]
        if (history) {
          map = { ...map, [storyId]: history }
          writeStoreMap(storageKey, map)
        }
      }

      if (!history) return null

      return normalizeStoryHistory(storyId, history)
    },

    async save(history: StoryHistory): Promise<void> {
      if (!history.storyId) return

      const map = readStoreMap(storageKey)
      map[history.storyId] = normalizeStoryHistory(history.storyId, history)
      writeStoreMap(storageKey, map)
    },

    async deleteForStory(storyId: string): Promise<void> {
      if (!storyId) return

      const map = readStoreMap(storageKey)
      if (!(storyId in map)) return

      delete map[storyId]
      writeStoreMap(storageKey, map)
    },
  }
}

export const localStoryHistoryStore = createLocalStoryHistoryStore(STORY_HISTORY_STORAGE_KEY)

export function createCloudStoryHistoryStore(userId: string): StoryHistoryStore {
  return createLocalStoryHistoryStore(`${STORY_HISTORY_STORAGE_KEY}-${userId}`)
}
