import { storyPromptTemplateV1 } from './v1'
import type { PromptVersion, StoryPromptTemplate } from './types'

const STORY_PROMPT_TEMPLATES: Record<PromptVersion, StoryPromptTemplate> = {
  v1: storyPromptTemplateV1,
}

export function getStoryPromptTemplate(version: PromptVersion): StoryPromptTemplate {
  return STORY_PROMPT_TEMPLATES[version]
}

export type { PromptVersion, StoryPromptMessages, StoryPromptTemplate } from './types'
export { PROMPT_VERSIONS, isPromptVersion } from './types'
