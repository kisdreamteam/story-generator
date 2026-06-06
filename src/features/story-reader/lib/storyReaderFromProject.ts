import { generatedStoryFromProject } from '@/features/story-generator/lib/story-project'
import type { GeneratedStory, StoryProject } from '@/features/stories/types'

/** Convert a stored story project into the reader's `GeneratedStory` shape. */
export function storyReaderContentFromProject(project: StoryProject): GeneratedStory | null {
  return generatedStoryFromProject(project)
}
