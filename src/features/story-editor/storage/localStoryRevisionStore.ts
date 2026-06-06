import type { StoryRevisionHistory, StoryRevisionStore } from '../types/storyRevision.types'
import { normalizeStoryRevisionHistory } from '../utils/storyRevisionUtils'

export const STORY_REVISIONS_STORAGE_KEY = 'story-revisions'

type StoryRevisionStoreMap = Record<string, StoryRevisionHistory>

function isStoryRevisionHistory(value: unknown): value is StoryRevisionHistory {
  if (!value || typeof value !== 'object') return false

  const history = value as StoryRevisionHistory
  return typeof history.storyId === 'string' && Array.isArray(history.revisions)
}

function readStoreMap(): StoryRevisionStoreMap {
  try {
    if (typeof localStorage === 'undefined') return {}

    const raw = localStorage.getItem(STORY_REVISIONS_STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const map: StoryRevisionStoreMap = {}
    for (const [storyId, history] of Object.entries(parsed as Record<string, unknown>)) {
      if (isStoryRevisionHistory(history)) {
        map[storyId] = history
      }
    }

    return map
  } catch {
    return {}
  }
}

function writeStoreMap(map: StoryRevisionStoreMap): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORY_REVISIONS_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Fail safely — revisions are best-effort and must not block saves.
  }
}

export const localStoryRevisionStore: StoryRevisionStore = {
  async load(storyId: string): Promise<StoryRevisionHistory | null> {
    if (!storyId) return null

    const map = readStoreMap()
    const history = map[storyId]
    if (!history) return null

    return normalizeStoryRevisionHistory(storyId, history)
  },

  async save(history: StoryRevisionHistory): Promise<void> {
    if (!history.storyId) return

    const map = readStoreMap()
    map[history.storyId] = normalizeStoryRevisionHistory(history.storyId, history)
    writeStoreMap(map)
  },

  async deleteForStory(storyId: string): Promise<void> {
    if (!storyId) return

    const map = readStoreMap()
    if (!(storyId in map)) return

    delete map[storyId]
    writeStoreMap(map)
  },
}
