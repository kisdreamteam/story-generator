import {
  getStoryPromptTemplate,
  isPromptVersion,
  type PromptVersion,
  type StoryPromptMessages,
} from './storyPromptTemplates'
import type { StoryPromptContract } from '../lib/generation/contracts/storyPromptContract'

/** Active prompt version from VITE_STORY_PROMPT_VERSION (default: v1). */
export function getActivePromptVersion(): PromptVersion {
  const raw = import.meta.env.VITE_STORY_PROMPT_VERSION?.trim().toLowerCase()

  if (raw && isPromptVersion(raw)) {
    return raw
  }

  return 'v1'
}

/** Build provider-ready prompt messages for the active (or selected) template version. */
export function buildStoryPromptMessages(
  contract: StoryPromptContract,
  version: PromptVersion = getActivePromptVersion(),
): StoryPromptMessages {
  return getStoryPromptTemplate(version).buildMessages(contract)
}

export {
  getStoryPromptTemplate,
  isPromptVersion,
  PROMPT_VERSIONS,
  type PromptVersion,
  type StoryPromptMessages,
  type StoryPromptTemplate,
} from './storyPromptTemplates'
