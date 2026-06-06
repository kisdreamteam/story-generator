import type { AIPromptContract } from '../../builders/buildAIPromptContract'
import { buildStoryOutputSchemaBlock } from './storyOutputSchemaTemplate'

export function buildStoryUserPrompt(
  contract: AIPromptContract,
  seriesName: string,
  seriesLines: string[],
  characterLines: string[],
  vocabularyLines: string[],
): string {
  const { setup, storyStructure, continuity, outputRequirements } = contract

  return [
    `Write a ${storyStructure.pageCount}-page story for the ${seriesName} series.`,
    '',
    '## Setup',
    `- Story purpose: ${setup.storyPurpose}`,
    `- Story tone: ${setup.storyTone}`,
    `- Theme: ${setup.theme}`,
    `- Setting: ${setup.setting}`,
    `- Lesson goal: ${setup.lessonGoal}`,
    `- Main events:\n${setup.mainEvents}`,
    `- Characters: ${setup.characters}`,
    `- Age range: ${setup.ageRange}`,
    `- Language: ${setup.language}`,
    `- Notes: ${setup.notes}`,
    '',
    '## Series continuity',
    ...seriesLines,
    '',
    '## Character continuity',
    ...characterLines,
    ...(continuity.visualStyleNotes.length
      ? ['', '## Visual style', ...continuity.visualStyleNotes.map((note) => `- ${note}`)]
      : []),
    '',
    '## Vocabulary continuity',
    ...vocabularyLines,
    '',
    '## Output requirements',
    buildStoryOutputSchemaBlock(outputRequirements.requiredPageCount),
  ].join('\n')
}
