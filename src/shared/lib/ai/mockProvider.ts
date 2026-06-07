import { validateAIStoryInput } from '@/shared/ai/builders'
import { delay, throwIfAborted } from '@/shared/ai/runtime/aiProviderAbort'
import {
  buildMockAIStoryGenerationResult,
  getMockAIImagePrompts,
  MOCK_AI_GENERATION_MS,
} from '@/shared/ai/providers/mock/mockStoryFixture'
import type { AIProvider } from './AIProvider'
import type {
  AIFlashcardOutput,
  AIGenerationInput,
  AIImagePromptOutput,
  AIProviderOptions,
  AIStoryOutput,
  AIValidationResult,
} from './types'

/** Static mock provider — same content the app showed before the AI boundary. */
export const mockAIProvider: AIProvider = {
  id: 'mock',

  validateInput(input: AIGenerationInput): AIValidationResult {
    return validateAIStoryInput(input)
  },

  async generateStory(
    input: AIGenerationInput,
    options?: AIProviderOptions,
  ): Promise<AIStoryOutput> {
    await delay(MOCK_AI_GENERATION_MS, options?.signal)
    throwIfAborted(options?.signal)
    return buildMockAIStoryGenerationResult(input.setup.pageCount).story
  },

  async generateFlashcards(
    input: AIGenerationInput,
    _story: AIStoryOutput,
    options?: AIProviderOptions,
  ): Promise<AIFlashcardOutput[]> {
    throwIfAborted(options?.signal)
    return buildMockAIStoryGenerationResult(input.setup.pageCount).flashcards
  },

  async generateImagePrompts(
    input: AIGenerationInput,
    _story: AIStoryOutput,
    options?: AIProviderOptions,
  ): Promise<AIImagePromptOutput[]> {
    throwIfAborted(options?.signal)
    return getMockAIImagePrompts(input.setup.pageCount)
  },
}
