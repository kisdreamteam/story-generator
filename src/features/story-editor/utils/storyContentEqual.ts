import type { EditableStoryContent, GeneratedStorySnapshot } from '../types'

export function storyContentEqual(
  left: GeneratedStorySnapshot | EditableStoryContent,
  right: GeneratedStorySnapshot | EditableStoryContent,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
