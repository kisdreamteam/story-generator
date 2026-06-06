import type { StoryProject } from '../types/story-generator.types'
import { getStoryDraft, loadDraftWithGeneratedStory } from './story-storage'

export async function loadDraftById(id: string): Promise<StoryProject | null> {
  return getStoryDraft(id)
}

export { loadDraftWithGeneratedStory }
