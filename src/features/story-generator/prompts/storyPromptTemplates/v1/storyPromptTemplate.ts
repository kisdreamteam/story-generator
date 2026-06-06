import type { StoryPromptContract } from '../../../lib/generation/contracts/storyPromptContract'
import type { StoryPromptMessages, StoryPromptTemplate } from '../types'

const EXAMPLE_GENERATED_AT = '2026-06-06T14:00:00.000Z'

function buildSystemPrompt(): string {
  return [
    'You are a children\'s story writer for the Nina & Nino series.',
    'Return only valid JSON matching the requested schema.',
    'Stories must be age-appropriate, warm, and safe for classroom use.',
    'Nina is the older sibling; Nino is the younger sibling.',
  ].join(' ')
}

function buildUserPrompt(contract: StoryPromptContract): string {
  const { setup, storyStructure, continuity, vocabulary, outputRequirements } = contract

  return [
    `Write a ${storyStructure.pageCount}-page story for the ${storyStructure.seriesName} series.`,
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
    '## Continuity',
    `- Character notes: ${continuity.characterNotes}`,
    ...continuity.visualStyleNotes.map((note) => `- Visual: ${note}`),
    '',
    '## Vocabulary',
    `- Focus: ${vocabulary.vocabularyFocus}`,
    `- Words to include: ${vocabulary.wordsToInclude || 'None specified'}`,
    `- Words to avoid: ${vocabulary.wordsToAvoid || 'None specified'}`,
    '',
    '## Output requirements',
    `Return JSON with exactly ${outputRequirements.requiredPageCount} story pages.`,
    'Each page must include pageNumber, text, wordCount, and teachingFocus.',
    'Include flashcards (word, simpleDefinition, exampleSentence) and imagePrompts (pageNumber, prompt, continuityReminder) for each page.',
    '',
    'JSON shape:',
    JSON.stringify(
      {
        title: 'string',
        summary: 'string',
        totalWordCount: 0,
        generatedAt: EXAMPLE_GENERATED_AT,
        storyPages: [
          {
            pageNumber: 1,
            text: 'string',
            wordCount: 0,
            teachingFocus: 'string',
          },
        ],
        flashcards: [
          {
            word: 'string',
            simpleDefinition: 'string',
            exampleSentence: 'string',
          },
        ],
        imagePrompts: [
          {
            pageNumber: 1,
            prompt: 'string',
            continuityReminder: 'string',
          },
        ],
      },
      null,
      2,
    ),
  ].join('\n')
}

/** Version 1 — dashboard Nina & Nino story generation prompt. */
export const storyPromptTemplateV1: StoryPromptTemplate = {
  version: 'v1',
  buildMessages(contract: StoryPromptContract): StoryPromptMessages {
    return {
      system: buildSystemPrompt(),
      user: buildUserPrompt(contract),
    }
  },
}
