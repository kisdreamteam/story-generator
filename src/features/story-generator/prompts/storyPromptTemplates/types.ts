import type { StoryPromptContract } from '../../lib/generation/contracts/storyPromptContract'

export interface StoryPromptMessages {
  system: string
  user: string
}

export interface StoryPromptTemplate {
  version: PromptVersion
  buildMessages: (contract: StoryPromptContract) => StoryPromptMessages
}

export const PROMPT_VERSIONS = ['v1'] as const

export type PromptVersion = (typeof PROMPT_VERSIONS)[number]

export function isPromptVersion(value: string): value is PromptVersion {
  return (PROMPT_VERSIONS as readonly string[]).includes(value)
}
