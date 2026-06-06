import type { StoryGenerationApi } from '../api/storyGenerationApi'
import type { AiGenerationAdapter, AiGenerationAdapterKind } from './aiGenerationAdapter.types'

/** Attach adapter metadata to a {@link StoryGenerationApi} implementation. */
export function createAiGenerationAdapter(
  kind: AiGenerationAdapterKind,
  id: string,
  api: StoryGenerationApi,
): AiGenerationAdapter {
  return {
    kind,
    id,
    validate: api.validate.bind(api),
    generateStory: api.generateStory.bind(api),
    generateFlashcards: api.generateFlashcards.bind(api),
    generateImagePrompts: api.generateImagePrompts.bind(api),
  }
}
