import type { GeneratedStory } from '@/features/stories/types'
import { buildStoryTextExport } from './buildStoryTextExport'
import type { StoryTextExportOptions } from '../types'

/** Copy plain story text to the clipboard. */
export async function copyStoryTextToClipboard(
  story: GeneratedStory,
  options: StoryTextExportOptions = {},
): Promise<void> {
  const text = buildStoryTextExport(story, options)

  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this browser.')
  }

  await navigator.clipboard.writeText(text)
}
