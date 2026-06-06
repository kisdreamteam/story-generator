import {
  buildAIPromptContract,
  type AIPromptContract,
  type AIPromptContinuitySection,
  type AIPromptOutputRequirementsSection,
  type AIPromptSetupSection,
  type AIPromptStructureSection,
  type AIPromptVocabularySection,
} from '@/shared/ai'
import type { StoryGenerationInput } from '../types'

export type StoryPromptSetupSection = AIPromptSetupSection
export type StoryPromptStructureSection = AIPromptStructureSection
export type StoryPromptContinuitySection = AIPromptContinuitySection
export type StoryPromptVocabularySection = AIPromptVocabularySection
export type StoryPromptOutputRequirementsSection = AIPromptOutputRequirementsSection
export type StoryPromptContract = AIPromptContract

/** Build a provider-agnostic prompt contract from teacher setup. */
export function buildStoryPromptContract(input: StoryGenerationInput): StoryPromptContract {
  return buildAIPromptContract({ setup: input.setup })
}
