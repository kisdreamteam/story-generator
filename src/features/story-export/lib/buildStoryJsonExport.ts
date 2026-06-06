import type { GeneratedStory } from '@/features/stories/types'
import type { StoryExportJsonPayload } from '../types'

function resolveTitle(story: GeneratedStory, projectTitle?: string): string {
  return projectTitle?.trim() || story.title.trim() || 'Untitled story'
}

/** Structured JSON payload for download export. */
export function buildStoryJsonExport(
  story: GeneratedStory,
  projectTitle?: string,
): StoryExportJsonPayload {
  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    projectTitle: resolveTitle(story, projectTitle),
    story,
  }
}
