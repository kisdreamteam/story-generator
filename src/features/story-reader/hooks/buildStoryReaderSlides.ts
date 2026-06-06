import type { GeneratedStory } from '@/features/stories/types'
import type { StoryReaderSlide, StoryReaderSlideLabel } from '../types'

export function buildStoryReaderSlides(story: GeneratedStory): StoryReaderSlide[] {
  const slides: StoryReaderSlide[] = [
    {
      kind: 'cover',
      title: story.title,
      summary: story.summary,
      pageCount: story.storyPages.length,
      wordCount: story.totalWordCount,
    },
  ]

  for (const [index, page] of story.storyPages.entries()) {
    slides.push({
      kind: 'story',
      page,
      index: index + 1,
      total: story.storyPages.length,
    })
  }

  if (story.flashcards.length > 0) {
    slides.push({
      kind: 'flashcards',
      cards: story.flashcards,
    })
  }

  slides.push({
    kind: 'end',
    title: story.title,
    pageCount: story.storyPages.length,
    flashcardCount: story.flashcards.length,
  })

  return slides
}

export function buildStoryReaderSlideLabels(slides: StoryReaderSlide[]): StoryReaderSlideLabel[] {
  return slides.map((slide, index) => {
    switch (slide.kind) {
      case 'cover':
        return { index, kind: slide.kind, label: 'Cover' }
      case 'story':
        return { index, kind: slide.kind, label: `Page ${slide.index}` }
      case 'flashcards':
        return { index, kind: slide.kind, label: 'Vocabulary' }
      case 'end':
        return { index, kind: slide.kind, label: 'End' }
    }
  })
}
