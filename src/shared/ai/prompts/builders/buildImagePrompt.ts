import type { AIPromptContract } from '../../builders/buildAIPromptContract'
import { buildCharacterContinuityReminder, extractVocabularyCues } from '../continuity'
import { buildImageContinuityReminder, buildImageScenePrompt } from '../templates'
import type { ImagePromptBuildInput, ImagePromptStrings, StoryPromptBuildOptions } from '../types'
import { resolveStoryPromptContext } from './buildStoryPrompt'

/** Build a single-page illustration prompt and continuity reminder. No network calls. */
export function buildImagePrompt(input: ImagePromptBuildInput): ImagePromptStrings {
  return {
    prompt: buildImageScenePrompt(input),
    continuityReminder: buildImageContinuityReminder(input),
  }
}

/** Build an image prompt from story contract context and page text. */
export function buildImagePromptFromContract(
  contract: AIPromptContract,
  pageNumber: number,
  pageText: string,
  options?: StoryPromptBuildOptions,
): ImagePromptStrings {
  const context = resolveStoryPromptContext(contract, options)

  return buildImagePrompt({
    pageNumber,
    pageText,
    seriesName: context.seriesName,
    characterContinuityLines: context.characterLines,
    visualStyleNotes: contract.continuity.visualStyleNotes,
    vocabularyCues: extractVocabularyCues(pageText, contract.vocabulary.wordsToInclude),
  })
}

/** Compact continuity reminder suitable for image prompt metadata. */
export function buildImageContinuityReminderFromContract(
  contract: AIPromptContract,
  options?: StoryPromptBuildOptions,
): string {
  const context = resolveStoryPromptContext(contract, options)

  return buildCharacterContinuityReminder(
    null,
    contract.setup.characters,
    contract.continuity.visualStyleNotes,
  ).concat(
    context.seriesName ? ` Series: ${context.seriesName}.` : '',
  )
}
