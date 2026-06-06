import type { StoryGenerationApi } from '@/features/story-generation/api/storyGenerationApi'
import { resolveAiGenerationAdapter } from '@/features/story-generation/adapters/resolveAiGenerationAdapter'

/** Resolve the active backend and expose it through the generation API boundary. */
export async function resolveStoryGenerationApi(): Promise<StoryGenerationApi> {
  return resolveAiGenerationAdapter()
}
