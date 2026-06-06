import type { GeneratedStory } from '@/features/stories/types'
import type { StoryTextExportOptions } from '../types'

function resolveTitle(story: GeneratedStory, projectTitle?: string): string {
  return projectTitle?.trim() || story.title.trim() || 'Untitled story'
}

/** Plain-text export for clipboard sharing. */
export function buildStoryTextExport(
  story: GeneratedStory,
  options: StoryTextExportOptions = {},
): string {
  const {
    projectTitle,
    includeSummary = true,
    includeTeachingFocus = true,
  } = options

  const lines: string[] = [resolveTitle(story, projectTitle)]

  if (includeSummary && story.summary.trim()) {
    lines.push('', story.summary.trim())
  }

  for (const page of story.storyPages) {
    lines.push('', `Page ${page.pageNumber}`, page.text.trim())

    if (includeTeachingFocus && page.teachingFocus.trim()) {
      lines.push('', `Teaching focus: ${page.teachingFocus.trim()}`)
    }
  }

  if (story.flashcards.length > 0) {
    lines.push('', 'Vocabulary cards')

    for (const card of story.flashcards) {
      lines.push('', card.word.trim())

      if (card.simpleDefinition.trim()) {
        lines.push(card.simpleDefinition.trim())
      }

      if (card.exampleSentence.trim()) {
        lines.push(`Example: ${card.exampleSentence.trim()}`)
      }
    }
  }

  return lines.join('\n').trim()
}
