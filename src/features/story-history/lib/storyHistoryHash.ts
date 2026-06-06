import type { GeneratedStory } from '@/features/stories/types'

export function cloneStoryHistorySnapshot(story: GeneratedStory): GeneratedStory {
  return JSON.parse(JSON.stringify(story)) as GeneratedStory
}

/** Stable fingerprint for deduplicating identical snapshots. */
export function createStoryHistoryContentHash(content: GeneratedStory): string {
  const json = JSON.stringify(content)
  let hash = 0

  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index)
    hash |= 0
  }

  return `sh-${Math.abs(hash).toString(36)}`
}

export function storyHistoryContentEqual(left: GeneratedStory, right: GeneratedStory): boolean {
  return createStoryHistoryContentHash(left) === createStoryHistoryContentHash(right)
}

export function formatStoryHistoryTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function createStoryHistoryEntryId(): string {
  return `sh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
