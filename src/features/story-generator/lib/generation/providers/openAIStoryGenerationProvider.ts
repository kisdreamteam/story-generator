import { mapStoryGenerationInputToAI } from '../adapters/aiStoryOutputMapping'
import type { StoryGenerationProvider, StoryGenerationProviderOptions } from '../storyGenerationProvider'
import type {
  GeneratedFlashcardOutput,
  GeneratedStoryCoreOutput,
  StoryGenerationInput,
} from '../types'

/** Legacy adapter for callers still on StoryGenerationProvider. */
export const openAIStoryGenerationProvider: StoryGenerationProvider = {
  async generateStory(
    input: StoryGenerationInput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedStoryCoreOutput> {
    const { openAIAIStoryProvider } = await import('./openAIAIStoryProvider')
    const aiInput = mapStoryGenerationInputToAI(input)
    const { story } = await openAIAIStoryProvider.generateStory(aiInput, options)
    return story
  },

  async generateFlashcards(
    input: StoryGenerationInput,
    _story: GeneratedStoryCoreOutput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedFlashcardOutput[]> {
    const { openAIAIStoryProvider } = await import('./openAIAIStoryProvider')
    const aiInput = mapStoryGenerationInputToAI(input)
    const { flashcards } = await openAIAIStoryProvider.generateStory(aiInput, options)
    return flashcards
  },
}
