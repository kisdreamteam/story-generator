import type { GeneratedStory } from '@/features/stories/types'
import type { StudentStorySlide } from '../types'

/** Story pages first, then the post-story activity menu. */
export function buildStudentStorySlides(story: GeneratedStory): StudentStorySlide[] {
  const slides: StudentStorySlide[] = story.storyPages.map((page, index) => ({
    kind: 'page',
    page,
    index: index + 1,
    total: story.storyPages.length,
  }))

  slides.push({ kind: 'activities' })

  return slides
}
