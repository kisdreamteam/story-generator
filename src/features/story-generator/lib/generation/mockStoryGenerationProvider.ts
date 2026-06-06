import type { StoryGenerationProvider } from './storyGenerationProvider'
import { mockAIStoryProvider } from '@/shared/ai'
import { mapStoryGenerationInputToAI } from './adapters/aiStoryOutputMapping'
import type {
  GeneratedFlashcardOutput,
  GeneratedStoryCoreOutput,
  GeneratedStoryOutput,
  StoryGenerationInput,
} from './types'
import type { StoryGenerationProviderOptions } from './storyGenerationProvider'
import {
  buildMockAIStoryGenerationResult,
  getMockAIImagePrompts,
} from '@/shared/ai/providers/mock/mockStoryFixture'
import { mapAIResultToGeneratedStoryOutput } from './adapters/aiStoryOutputMapping'

/** Static mock output — same content the app showed before the generation boundary. */
export function getMockGeneratedStoryOutput(): GeneratedStoryOutput {
  const { story, flashcards } = buildMockAIStoryGenerationResult()

  return mapAIResultToGeneratedStoryOutput(story, flashcards, getMockAIImagePrompts())
}

/** Legacy story provider adapter — delegates to the shared mock AI provider. */
export const mockStoryGenerationProvider: StoryGenerationProvider = {
  async generateStory(
    input: StoryGenerationInput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedStoryCoreOutput> {
    const aiInput = mapStoryGenerationInputToAI(input)
    const { story } = await mockAIStoryProvider.generateStory(aiInput, options)
    return story
  },

  async generateFlashcards(
    input: StoryGenerationInput,
    _story: GeneratedStoryCoreOutput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedFlashcardOutput[]> {
    const aiInput = mapStoryGenerationInputToAI(input)
    const { flashcards } = await mockAIStoryProvider.generateStory(aiInput, options)
    return flashcards
  },
}
