import type {
  AIStoryGenerationInput,
  AIStoryProvider,
  AIStoryProviderOptions,
} from '@/shared/ai/types'
import type { AIProvider } from './AIProvider'
import type { AIGenerationInput } from './types'

function toLegacyInput(input: AIGenerationInput): AIStoryGenerationInput {
  return { setup: input.setup }
}

/** Bridge the new {@link AIProvider} contract to the legacy {@link AIStoryProvider} API. */
export function adaptAIProviderToLegacyStoryProvider(provider: AIProvider): AIStoryProvider {
  return {
    id: provider.id,
    validateInput: (input) => provider.validateInput({ setup: input.setup }),
    async generateStory(input, options?: AIStoryProviderOptions) {
      const aiInput = { setup: input.setup }
      const story = await provider.generateStory(aiInput, options)
      const flashcards = await provider.generateFlashcards(aiInput, story, options)
      return { story, flashcards }
    },
    async generateImages(input, story, options?: AIStoryProviderOptions) {
      return provider.generateImagePrompts({ setup: input.setup }, story, options)
    },
  }
}

/** Bridge a legacy {@link AIStoryProvider} into the new {@link AIProvider} contract. */
export function adaptLegacyStoryProviderToAIProvider(provider: AIStoryProvider): AIProvider {
  return {
    id: provider.id,
    validateInput: (input) => provider.validateInput(toLegacyInput(input)),
    async generateStory(input, options) {
      const result = await provider.generateStory(toLegacyInput(input), options)
      return result.story
    },
    async generateFlashcards(input, _story, options) {
      const result = await provider.generateStory(toLegacyInput(input), options)
      return result.flashcards
    },
    async generateImagePrompts(input, story, options) {
      return provider.generateImages(toLegacyInput(input), story, options)
    },
  }
}
