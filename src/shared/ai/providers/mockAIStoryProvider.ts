import { validateAIStoryInput } from '../builders'
import { delay, throwIfAborted } from '../runtime/aiProviderAbort'
import type {
  AIStoryCoreOutput,
  AIStoryGenerationInput,
  AIStoryGenerationResult,
  AIStoryProvider,
  AIStoryProviderOptions,
  AIStoryValidationResult,
} from '../types'
import {
  buildMockAIStoryGenerationResult,
  getMockAIImagePrompts,
  MOCK_AI_GENERATION_MS,
} from './mock/mockStoryFixture'

/** Static mock provider — same content the app showed before the AI boundary. */
export const mockAIStoryProvider: AIStoryProvider = {
  id: 'mock',

  validateInput(input: AIStoryGenerationInput): AIStoryValidationResult {
    return validateAIStoryInput(input)
  },

  async generateStory(
    _input: AIStoryGenerationInput,
    options?: AIStoryProviderOptions,
  ): Promise<AIStoryGenerationResult> {
    await delay(MOCK_AI_GENERATION_MS, options?.signal)
    throwIfAborted(options?.signal)
    return buildMockAIStoryGenerationResult()
  },

  async generateImages(
    _input: AIStoryGenerationInput,
    _story: AIStoryCoreOutput,
    options?: AIStoryProviderOptions,
  ) {
    throwIfAborted(options?.signal)
    return getMockAIImagePrompts()
  },
}
