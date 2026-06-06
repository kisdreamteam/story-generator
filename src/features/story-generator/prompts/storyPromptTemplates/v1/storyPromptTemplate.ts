import { buildStoryPrompt } from '@/shared/ai/prompts'
import type { StoryPromptContract } from '../../../lib/generation/contracts/storyPromptContract'
import type { StoryPromptMessages, StoryPromptTemplate } from '../types'

/** Version 1 — dashboard Nina & Nino story generation prompt. */
export const storyPromptTemplateV1: StoryPromptTemplate = {
  version: 'v1',
  buildMessages(contract: StoryPromptContract): StoryPromptMessages {
    return buildStoryPrompt(contract)
  },
}
