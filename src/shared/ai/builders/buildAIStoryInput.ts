import type { StorySetupInput } from '@/features/stories/types'
import type { AIStoryGenerationInput } from '../types'

/** Map persisted or form setup into the AI generation boundary input. */
export function buildAIStoryInput(setup: StorySetupInput): AIStoryGenerationInput {
  return { setup }
}
