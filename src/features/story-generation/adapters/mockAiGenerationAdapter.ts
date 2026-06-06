import { createStoryGenerationApi } from '@/features/story-generator/lib/generation/adapters/createStoryGenerationApi'
import { mockAIProvider } from '@/shared/lib/ai'
import { createAiGenerationAdapter } from './createAiGenerationAdapter'

/** Mock generation adapter — same deterministic output as the pre-AI create flow. */
export const mockAiGenerationAdapter = createAiGenerationAdapter(
  'mock',
  mockAIProvider.id,
  createStoryGenerationApi(mockAIProvider),
)
