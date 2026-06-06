import type { StoryMemory } from '@/features/story-memory'
import type { StoryContextPreviousStory, ThemeFrequencyEntry } from '../models'

function normalizeThemeKey(theme: string): string {
  return theme.trim().toLowerCase()
}

function resolveMemories(memories: StoryMemory[], excludeStoryId?: string): StoryMemory[] {
  if (!excludeStoryId) {
    return memories
  }

  return memories.filter((memory) => memory.storyId !== excludeStoryId)
}

/** Aggregate themes used across stored story memories. */
export function getPreviouslyUsedThemes(options: {
  memories: StoryMemory[]
  excludeStoryId?: string
}): { themes: string[]; frequency: ThemeFrequencyEntry[] } {
  const memories = resolveMemories(options.memories, options.excludeStoryId)
  const frequencyByKey = new Map<string, ThemeFrequencyEntry>()

  for (const memory of memories) {
    for (const theme of memory.themesUsed) {
      const trimmed = theme.trim()
      if (!trimmed) continue

      const key = normalizeThemeKey(trimmed)
      const existing = frequencyByKey.get(key)

      if (existing) {
        if (!existing.storyIds.includes(memory.storyId)) {
          existing.storyIds.push(memory.storyId)
          existing.count += 1
        }
        continue
      }

      frequencyByKey.set(key, {
        theme: trimmed,
        count: 1,
        storyIds: [memory.storyId],
      })
    }
  }

  const frequency = [...frequencyByKey.values()].sort((left, right) => {
    const countCompare = right.count - left.count
    if (countCompare !== 0) return countCompare
    return left.theme.localeCompare(right.theme)
  })

  return {
    themes: frequency.map((entry) => entry.theme),
    frequency,
  }
}

/** Map story memories into previous-story context entries. */
export function mapPreviousStories(memories: StoryMemory[]): StoryContextPreviousStory[] {
  return [...memories]
    .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))
    .map((memory) => ({
      storyId: memory.storyId,
      title: memory.title,
      generatedAt: memory.generatedAt,
      charactersUsed: [...memory.charactersUsed],
      locationsUsed: [...memory.locationsUsed],
      themesUsed: [...memory.themesUsed],
      vocabularyUsed: [...memory.vocabularyUsed],
    }))
}
