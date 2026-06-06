import { DEFAULT_LANGUAGE } from '../../story-projects/config/formOptions'
import { getSeriesById } from '../../series/services/series.service'
import type { StoryPromptOutput } from '../prompt.types'
import type { StoryGenerationInput } from '../types'

/**
 * Builds the prompt payload sent to our backend (via requestAiStoryGeneration).
 * The browser must not call an AI provider directly with this prompt.
 */
export function buildStoryPrompt(input: StoryGenerationInput): StoryPromptOutput {
  const series = getSeriesById(input.seriesId)
  const seriesName = series?.name ?? 'Nina & Nino'

  const characterLines =
    series?.characters.map((c) => `- ${c.name}: ${c.role}`).join('\n') ??
    '- Nina (older child) and Nino (younger child): sibling protagonists'

  const visualLines =
    input.visualContinuityNotes.map((note) => `- ${note}`).join('\n') ||
    '- Maintain consistent character appearance and illustration style'

  return {
    systemInstruction: buildSystemInstruction(input, seriesName, series),
    userInstruction: buildUserInstruction(input, seriesName, characterLines),
    outputFormatInstruction: buildOutputFormatInstruction(input.pageCount, input.language),
    continuityInstruction: buildContinuityInstruction(seriesName, characterLines, visualLines),
    safetyInstruction: buildSafetyInstruction(input.ageRange),
  }
}

function buildSystemInstruction(
  input: StoryGenerationInput,
  seriesName: string,
  series: ReturnType<typeof getSeriesById>,
): string {
  const languageNote =
    input.language === DEFAULT_LANGUAGE
      ? 'Generate all story content in English by default.'
      : `Primary generation language is ${DEFAULT_LANGUAGE}. Translation to ${input.language} is not wired yet — still generate the original story in English.`

  return [
    `You are a children's story writer for the "${seriesName}" series.`,
    `Write for ages ${input.ageRange}.`,
    languageNote,
    'Future translations (Korean, Vietnamese, etc.) must not change the original English story generation flow.',
    series?.toneAndStyleNotes ?? 'Use warm, playful, age-appropriate language.',
    series?.vocabularyLevelNotes ?? 'Introduce vocabulary naturally with repetition.',
    'Nina is the older child; Nino is the younger child. They are siblings, not twins.',
    'Stories should feel culturally grounded, safe, and encouraging for classroom use.',
  ].join(' ')
}

function buildUserInstruction(
  input: StoryGenerationInput,
  seriesName: string,
  characterLines: string,
): string {
  const mainEventLines = input.mainEvents
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join('\n')

  return [
    `Create a ${input.pageCount}-page story for the ${seriesName} series.`,
    '',
    '## Teacher intent',
    `- Story purpose: ${input.storyPurpose}`,
    `- Story tone: ${input.storyTone}`,
    `- Main events / activities:`,
    mainEventLines || '- None specified',
    `- Words to include: ${input.wordsToInclude.trim() || 'None specified'}`,
    `- Words to avoid: ${input.wordsToAvoid.trim() || 'None specified'}`,
    '',
    '## Story world',
    `- Theme: ${input.theme}`,
    `- Setting: ${input.setting}`,
    '',
    '## Language and learning',
    `- Language: ${input.language} (generate in English by default)`,
    `- Age range: ${input.ageRange}`,
    `- Vocabulary focus: ${input.vocabularyFocus}`,
    `- Learning goal: ${input.learningGoal}`,
    '',
    '## Characters',
    characterLines,
    '',
    '## Additional teacher notes',
    input.notes || 'None provided.',
  ].join('\n')
}

function buildOutputFormatInstruction(pageCount: number, language: string): string {
  return [
    `Return structured JSON in English (default language: ${DEFAULT_LANGUAGE}).`,
    language !== DEFAULT_LANGUAGE
      ? `Note: ${language} translation may be requested later — do not alter the English generation structure.`
      : '',
    '',
    'Schema:',
    '',
    '{',
    '  "title": "string",',
    '  "summary": "string — one paragraph describing the story and learning outcomes",',
    '  "pages": [',
    '    {',
    '      "pageNumber": number,',
    '      "text": "string — story text for this page",',
    '      "wordCount": number,',
    '      "teachingFocus": "string — what this page teaches"',
    '    }',
    `  ] — exactly ${pageCount} pages, numbered 1 through ${pageCount},`,
    '  "flashcards": [',
    '    {',
    '      "word": "string",',
    '      "simpleDefinition": "string",',
    '      "exampleSentence": "string — pulled from the story"',
    '    }',
    '  ],',
    '  "imagePrompts": [',
    '    {',
    '      "pageNumber": number,',
    '      "prompt": "string — illustration prompt for this page",',
    '      "continuityReminder": "string — visual consistency notes"',
    '    }',
    '  ] — one imagePrompt per page',
    '}',
    '',
    'Do not include markdown fences or commentary outside the JSON object.',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildContinuityInstruction(
  seriesName: string,
  characterLines: string,
  visualLines: string,
): string {
  return [
    `Maintain ${seriesName} series continuity across all pages and image prompts.`,
    'Nina is the older child; Nino is the younger child — depict them as siblings, not twins.',
    '',
    '## Character continuity',
    characterLines,
    '',
    '## Visual continuity',
    visualLines,
    '',
    'Every imagePrompt must include a continuityReminder referencing character outfits, props, and art style.',
  ].join('\n')
}

function buildSafetyInstruction(ageRange: string): string {
  return [
    `Content must be appropriate for ages ${ageRange}.`,
    'Avoid violence, fear, stereotypes, unsafe situations, and adult themes.',
    'Use inclusive, respectful language.',
    'Keep dialogue and scenarios suitable for classroom and family reading.',
    'Do not include personal data, real URLs, or brand names unless provided in teacher notes.',
  ].join(' ')
}
