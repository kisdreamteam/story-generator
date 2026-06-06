import type { StoryMemory } from '../models'

export const STORY_MEMORY_STORAGE_KEY = 'story-memory'

function isStoryMemory(value: unknown): value is StoryMemory {
  if (!value || typeof value !== 'object') return false

  const memory = value as StoryMemory
  return (
    typeof memory.storyId === 'string' &&
    memory.storyId.length > 0 &&
    typeof memory.title === 'string' &&
    Array.isArray(memory.charactersUsed) &&
    Array.isArray(memory.locationsUsed) &&
    Array.isArray(memory.themesUsed) &&
    Array.isArray(memory.vocabularyUsed) &&
    typeof memory.generatedAt === 'string' &&
    memory.generatedAt.length > 0
  )
}

function readMemories(): StoryMemory[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(STORY_MEMORY_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoryMemory)
  } catch {
    return []
  }
}

function writeMemories(memories: StoryMemory[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORY_MEMORY_STORAGE_KEY, JSON.stringify(memories))
  } catch {
    // Ignore quota / private mode errors.
  }
}

/** Persist or update a story memory record keyed by storyId. */
export function saveStoryMemory(memory: StoryMemory): void {
  if (!memory.storyId) return

  const memories = readMemories()
  const existingIndex = memories.findIndex((item) => item.storyId === memory.storyId)

  if (existingIndex >= 0) {
    memories[existingIndex] = memory
  } else {
    memories.push(memory)
  }

  writeMemories(memories)
}

/** Load a single story memory by id. Returns null when missing or invalid. */
export function loadStoryMemory(storyId: string): StoryMemory | null {
  if (!storyId) return null

  return readMemories().find((memory) => memory.storyId === storyId) ?? null
}

/** Load all stored story memories, newest generated first. */
export function loadAllStoryMemories(): StoryMemory[] {
  return readMemories().sort(
    (left, right) => right.generatedAt.localeCompare(left.generatedAt),
  )
}

/** Remove a story memory record. No-op when the id is missing. */
export function deleteStoryMemory(storyId: string): void {
  if (!storyId) return

  writeMemories(readMemories().filter((memory) => memory.storyId !== storyId))
}
