import type { GeneratedStory } from '../types'

export function cloneGeneratedStory(story: GeneratedStory): GeneratedStory {
  return JSON.parse(JSON.stringify(story)) as GeneratedStory
}

export function countStoryWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Recompute page and total word counts after text edits. */
export function withRecalculatedWordCounts(story: GeneratedStory): GeneratedStory {
  const storyPages = story.storyPages.map((page) => ({
    ...page,
    wordCount: countStoryWords(page.text),
  }))

  return {
    ...story,
    storyPages,
    totalWordCount: storyPages.reduce((sum, page) => sum + page.wordCount, 0),
  }
}
