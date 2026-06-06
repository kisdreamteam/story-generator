import type { GeneratedStory } from '@/features/stories/types'
import { buildStoryJsonExport } from './buildStoryJsonExport'
import { slugifyStoryFilename } from './slugifyStoryFilename'

/** Trigger a browser download of the story JSON export. */
export function downloadStoryJson(story: GeneratedStory, projectTitle?: string): void {
  const payload = buildStoryJsonExport(story, projectTitle)
  const filename = `${slugifyStoryFilename(payload.projectTitle)}.json`
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.rel = 'noopener'
    anchor.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
