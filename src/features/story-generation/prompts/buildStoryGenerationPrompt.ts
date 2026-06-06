import type { StorySetupInput } from '@/features/stories/types'
import type {
  StoryGenerationFlashcardRequirements,
  StoryGenerationImagePromptRequirements,
  StoryGenerationNinaNinoContinuitySection,
  StoryGenerationPrompt,
  StoryGenerationStructuredPrompt,
} from './storyGenerationPrompt.types'

const NINA_NINO_SERIES_NAME = 'Nina & Nino'

const NINA_NINO_CONTINUITY_RULES = [
  'Nina is the older sibling; Nino is the younger sibling.',
  'Nina and Nino are siblings, not twins.',
  'Keep their names, roles, and personalities consistent on every page.',
  'Stories should feel warm, playful, and safe for classroom use.',
] as const

const NINA_NINO_VISUAL_STYLE_NOTES = [
  'Nina (older child) wears indigo; Nino (younger child) wears emerald green.',
  'Use a warm watercolor illustration style.',
  'Depict Nina and Nino as siblings with distinct ages, not as twins.',
] as const

const READING_LEVEL_BY_AGE_RANGE: Record<string, string> = {
  '3-4':
    'Pre-reader — very short sentences, concrete nouns, heavy repetition, and picture-friendly pacing.',
  '4-6':
    'Early reader — simple sentences, familiar vocabulary, gentle sentence variety, and clear story beats.',
  '6-8':
    'Developing reader — slightly longer sentences, richer vocabulary, and more detailed cause-and-effect.',
}

const DEFAULT_READING_LEVEL =
  'Age-appropriate — short, clear sentences with vocabulary matched to the selected age range.'

function splitList(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function splitMainEvents(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Map teacher age range to a reading-level guidance string. */
export function resolveReadingLevelFromAgeRange(ageRange: string): string {
  const normalized = ageRange.trim()

  return READING_LEVEL_BY_AGE_RANGE[normalized] ?? DEFAULT_READING_LEVEL
}

function buildNinaNinoContinuity(setup: StorySetupInput): StoryGenerationNinaNinoContinuitySection {
  const characterNotes =
    setup.characters.trim() || 'Nina (older sibling) and Nino (younger sibling) as protagonists.'

  return {
    seriesName: NINA_NINO_SERIES_NAME,
    rules: [...NINA_NINO_CONTINUITY_RULES],
    characterNotes,
    visualStyleNotes: [...NINA_NINO_VISUAL_STYLE_NOTES],
  }
}

function buildFlashcardRequirements(pageCount: number): StoryGenerationFlashcardRequirements {
  const minCount = Math.max(4, Math.min(pageCount, 6))
  const maxCount = Math.max(minCount, pageCount * 2)

  return {
    minCount,
    maxCount,
    requiredFields: ['word', 'simpleDefinition', 'exampleSentence'],
    rules: [
      `Provide between ${minCount} and ${maxCount} flashcards.`,
      'Each flashcard must include word, simpleDefinition, and exampleSentence.',
      'Definitions must be age-appropriate and easy for teachers to read aloud.',
      'Example sentences must come from or closely reflect the story text.',
      'Prioritize vocabulary from the teacher focus, lesson goal, and words to include.',
      'Do not introduce flashcard words listed in words to avoid.',
    ],
  }
}

function buildImagePromptRequirements(pageCount: number): StoryGenerationImagePromptRequirements {
  return {
    promptsPerPage: pageCount,
    requiredFields: ['pageNumber', 'prompt', 'continuityReminder'],
    rules: [
      `Provide exactly ${pageCount} image prompts — one per story page.`,
      'Each image prompt must include pageNumber, prompt, and continuityReminder.',
      'Prompts must describe a single illustration scene matching the page text.',
      'Continuity reminders must reference Nina and Nino outfits, props, setting, and art style.',
      'Keep character appearance and illustration style consistent across all pages.',
    ],
  }
}

function buildStructuredPrompt(setup: StorySetupInput): StoryGenerationStructuredPrompt {
  const pageCount = setup.pageCount

  return {
    ageRange: setup.ageRange,
    readingLevel: resolveReadingLevelFromAgeRange(setup.ageRange),
    storyPurpose: setup.storyPurpose,
    tone: setup.storyTone,
    pageCount,
    language: setup.language,
    lessonGoal: setup.lessonGoal,
    theme: setup.theme,
    setting: setup.setting,
    mainEvents: splitMainEvents(setup.mainEvents),
    notes: setup.notes.trim(),
    vocabulary: {
      focus: setup.vocabularyFocus,
      wordsToInclude: splitList(setup.wordsToInclude),
      wordsToAvoid: splitList(setup.wordsToAvoid),
    },
    ninaNinoContinuity: buildNinaNinoContinuity(setup),
    flashcardRequirements: buildFlashcardRequirements(pageCount),
    imagePromptRequirements: buildImagePromptRequirements(pageCount),
  }
}

function formatList(items: string[], emptyLabel: string): string {
  if (items.length === 0) {
    return `- ${emptyLabel}`
  }

  return items.map((item) => `- ${item}`).join('\n')
}

function buildSystemPrompt(structured: StoryGenerationStructuredPrompt): string {
  const { ninaNinoContinuity } = structured

  return [
    `You are a children's story writer for the "${ninaNinoContinuity.seriesName}" series.`,
    'Return only valid JSON matching the requested schema.',
    `Write for ages ${structured.ageRange}.`,
    `Reading level: ${structured.readingLevel}`,
    'Preserve Nina & Nino series continuity across characters, settings, tone, and illustrations.',
    'Stories must be age-appropriate, warm, and safe for classroom use.',
    'Use inclusive, respectful language and avoid unsafe or adult themes.',
  ].join(' ')
}

function buildUserPrompt(structured: StoryGenerationStructuredPrompt): string {
  const { ninaNinoContinuity, flashcardRequirements, imagePromptRequirements, vocabulary } =
    structured

  return [
    `Create a ${structured.pageCount}-page story for the ${ninaNinoContinuity.seriesName} series.`,
    '',
    '## Audience',
    `- Age range: ${structured.ageRange}`,
    `- Reading level: ${structured.readingLevel}`,
    `- Language: ${structured.language}`,
    '',
    '## Story purpose and tone',
    `- Story purpose: ${structured.storyPurpose}`,
    `- Tone: ${structured.tone}`,
    `- Page count: ${structured.pageCount}`,
    '',
    '## Story world',
    `- Theme: ${structured.theme}`,
    `- Setting: ${structured.setting}`,
    `- Lesson goal: ${structured.lessonGoal}`,
    '',
    '## Main events',
    formatList(structured.mainEvents, 'None specified'),
    '',
    '## Vocabulary',
    `- Vocabulary focus: ${vocabulary.focus}`,
    `- Words to include: ${vocabulary.wordsToInclude.join(', ') || 'None specified'}`,
    `- Words to avoid: ${vocabulary.wordsToAvoid.join(', ') || 'None specified'}`,
    '',
    '## Nina & Nino continuity',
    `- Series: ${ninaNinoContinuity.seriesName}`,
    ...ninaNinoContinuity.rules.map((rule) => `- ${rule}`),
    `- Character notes: ${ninaNinoContinuity.characterNotes}`,
    '',
    '### Visual continuity',
    ...ninaNinoContinuity.visualStyleNotes.map((note) => `- ${note}`),
    '',
    '## Flashcard requirements',
    ...flashcardRequirements.rules.map((rule) => `- ${rule}`),
    '',
    '## Image prompt requirements',
    ...imagePromptRequirements.rules.map((rule) => `- ${rule}`),
    '',
    '## Additional teacher notes',
    structured.notes || 'None provided.',
    '',
    '## Output format',
    buildOutputFormatBlock(structured.pageCount),
  ].join('\n')
}

function buildOutputFormatBlock(pageCount: number): string {
  return [
    `Return JSON with exactly ${pageCount} story pages.`,
    'Each page must include pageNumber, text, wordCount, and teachingFocus.',
    'Include flashcards (word, simpleDefinition, exampleSentence) and imagePrompts (pageNumber, prompt, continuityReminder) for each page.',
    '',
    'JSON shape:',
    JSON.stringify(
      {
        title: 'string',
        summary: 'string',
        totalWordCount: 0,
        generatedAt: '2026-06-06T14:00:00.000Z',
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

/** Convert teacher setup into a structured AI prompt. No network calls. */
export function buildStoryGenerationPrompt(setup: StorySetupInput): StoryGenerationPrompt {
  const structured = buildStructuredPrompt(setup)

  return {
    structured,
    system: buildSystemPrompt(structured),
    user: buildUserPrompt(structured),
  }
}
