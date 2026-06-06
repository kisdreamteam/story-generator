import type { StoryProject } from '../../types/story-generator.types'
import { generatedStoryFromProject } from '../story-project'
import type { GeneratedStory } from '@/features/stories/types'
import { mergeGeneratedStoryUpdate } from './mergeStoryUpdate'
import type { LoadDraftWithGeneratedStoryResult, StoryStorageAdapter, StoryStorageAdapterAsync } from './StoryStorageAdapter'

export const STORY_DRAFTS_STORAGE_KEY = 'story-drafts'

function isStoryProject(value: unknown): value is StoryProject {
  if (!value || typeof value !== 'object') return false

  const project = value as StoryProject
  return typeof project.id === 'string' && project.id.length > 0
}

/** Read all drafts from localStorage. Returns [] on missing or invalid data. */
function readDrafts(): StoryProject[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(STORY_DRAFTS_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoryProject)
  } catch {
    return []
  }
}

/** Write drafts to localStorage. Swallows quota and access errors. */
function writeDrafts(drafts: StoryProject[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORY_DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  } catch {
    // Ignore write failures (private mode, quota, etc.).
  }
}

export const localStoryStorageAdapter: StoryStorageAdapter = {
  saveStoryDraft(project: StoryProject): void {
    try {
      if (!project.id) return

      const drafts = readDrafts()
      const now = new Date().toISOString()
      const draft: StoryProject = {
        ...project,
        createdAt: project.createdAt || now,
        updatedAt: now,
      }

      const existingIndex = drafts.findIndex((item) => item.id === project.id)
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft
      } else {
        drafts.push(draft)
      }

      writeDrafts(drafts)
    } catch {
      // Fail safely — caller can treat save as best-effort.
    }
  },

  updateStory(id: string, generatedStory: GeneratedStory): StoryProject | null {
    try {
      if (!id) return null

      const existing = readDrafts().find((draft) => draft.id === id) ?? null
      if (!existing) return null

      const updated = mergeGeneratedStoryUpdate(existing, generatedStory)
      localStoryStorageAdapter.saveStoryDraft(updated)

      return localStoryStorageAdapter.getStoryDraft(id) ?? updated
    } catch {
      return null
    }
  },

  getStoryDrafts(): StoryProject[] {
    return readDrafts()
  },

  getStoryDraft(id: string): StoryProject | null {
    try {
      if (!id) return null

      return readDrafts().find((draft) => draft.id === id) ?? null
    } catch {
      return null
    }
  },

  deleteStoryDraft(id: string): void {
    if (!id) {
      throw new Error('Cannot delete story without an id.')
    }

    const drafts = readDrafts()
    const exists = drafts.some((draft) => draft.id === id)
    if (!exists) {
      throw new Error(`Story not found: ${id}`)
    }

    writeDrafts(drafts.filter((draft) => draft.id !== id))
  },

  clearStoryDrafts(): void {
    try {
      if (typeof localStorage === 'undefined') return

      localStorage.removeItem(STORY_DRAFTS_STORAGE_KEY)
    } catch {
      // Fail safely.
    }
  },

  loadDraftWithGeneratedStory(id: string): LoadDraftWithGeneratedStoryResult | null {
    try {
      if (!id) return null

      const draft = readDrafts().find((item) => item.id === id) ?? null
      if (!draft) return null

      const generatedStory = generatedStoryFromProject(draft)
      if (!generatedStory) return null

      return { draft, generatedStory }
    } catch {
      return null
    }
  },
}

/** Async wrapper around the sync local adapter for the public storage boundary. */
export const localStoryStorageAdapterAsync: StoryStorageAdapterAsync = {
  getStoryDraft: (id) => Promise.resolve(localStoryStorageAdapter.getStoryDraft(id)),
  getStoryDrafts: () => Promise.resolve(localStoryStorageAdapter.getStoryDrafts()),
  saveStoryDraft: async (project) => {
    localStoryStorageAdapter.saveStoryDraft(project)
    return localStoryStorageAdapter.getStoryDraft(project.id) ?? project
  },
  updateStory: async (id, generatedStory) => {
    const updated = localStoryStorageAdapter.updateStory(id, generatedStory)
    if (!updated) {
      throw new Error(`Story not found: ${id}`)
    }
    return updated
  },
  deleteStoryDraft: (id) => Promise.resolve(localStoryStorageAdapter.deleteStoryDraft(id)),
  clearStoryDrafts: () => Promise.resolve(localStoryStorageAdapter.clearStoryDrafts()),
  loadDraftWithGeneratedStory: (id) =>
    Promise.resolve(localStoryStorageAdapter.loadDraftWithGeneratedStory(id)),
}
