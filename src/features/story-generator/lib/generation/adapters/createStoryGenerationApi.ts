import type {
  StoryGenerationApi,
  StoryGenerationRequest,
  StoryGenerationRequestOptions,
} from '@/features/story-generation/api/storyGenerationApi'
import type { AIProvider } from '@/shared/lib/ai'

/** Wire a concrete {@link AIProvider} into the generation API boundary. */
export function createStoryGenerationApi(provider: AIProvider): StoryGenerationApi {
  return {
    validate(request: StoryGenerationRequest) {
      return provider.validateInput({ setup: request.setup })
    },

    generateStory(request: StoryGenerationRequest, options?: StoryGenerationRequestOptions) {
      return provider.generateStory({ setup: request.setup }, options)
    },

    generateFlashcards(
      request: StoryGenerationRequest,
      story,
      options?: StoryGenerationRequestOptions,
    ) {
      return provider.generateFlashcards({ setup: request.setup }, story, options)
    },

    generateImagePrompts(
      request: StoryGenerationRequest,
      story,
      options?: StoryGenerationRequestOptions,
    ) {
      return provider.generateImagePrompts({ setup: request.setup }, story, options)
    },
  }
}
