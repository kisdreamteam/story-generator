import {
  ageGroupOptions,
  DEFAULT_LANGUAGE,
  languageOptions,
  pageCountOptions,
} from '../../story-projects/config/formOptions'
import type { StorySetupInput } from '../types'

export interface StorySetupFormValues {
  lessonGoal: string
  learningObjectives: string
  vocabularyWords: string
  title: string
  theme: string
  setting: string
  ageRange: string
  language: string
  pageCount: string
  mainCharacters: string
  additionalCharacters: string
  majorEvents: string
  additionalNotes: string
}

export const storySetupFormDefaults: StorySetupFormValues = {
  lessonGoal: 'Learn fire safety words and describe community helpers.',
  learningObjectives: 'Name community helpers, practice safety vocabulary, retell key events.',
  vocabularyWords: 'fire station, firefighter, helmet, hose, safety',
  title: 'Nina and Nino Visit the Fire Station',
  theme: 'Field trip to a fire station',
  setting: 'City fire station and classroom',
  ageRange: '4-6',
  language: DEFAULT_LANGUAGE,
  pageCount: '12',
  mainCharacters: 'Nina (older sibling), Nino (younger sibling)',
  additionalCharacters: 'Ms. Lee (teacher), Firefighter Ana, classmates',
  majorEvents: `Class learns about the field trip
Walk to the fire station
Meet Firefighter Ana
Explore the fire truck and gear
Practice safety skills
Share what they learned at school`,
  additionalNotes: 'Keep tone warm and classroom-friendly. Nina and Nino are siblings, not twins.',
}

const extendedPageCountOptions = [
  ...pageCountOptions,
  { value: '12', label: '12 pages' },
]

export { extendedPageCountOptions as storyPageCountOptions, ageGroupOptions, languageOptions }

const WORKING_TITLE_PREFIX = 'Working title: '

export function parseTitleFromNotes(notes: string): {
  title: string
  additionalNotes: string
} {
  if (!notes.startsWith(WORKING_TITLE_PREFIX)) {
    return { title: '', additionalNotes: notes.trim() }
  }

  const rest = notes.slice(WORKING_TITLE_PREFIX.length)
  const splitIndex = rest.indexOf('\n\n')

  if (splitIndex === -1) {
    return { title: rest.trim(), additionalNotes: '' }
  }

  return {
    title: rest.slice(0, splitIndex).trim(),
    additionalNotes: rest.slice(splitIndex + 2).trim(),
  }
}

export function parseCharactersFromInput(characters: string): {
  mainCharacters: string
  additionalCharacters: string
} {
  const lines = characters
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    mainCharacters: lines[0] ?? '',
    additionalCharacters: lines.slice(1).join('\n'),
  }
}

export function getAgeRangeLabel(value: string): string {
  return ageGroupOptions.find((option) => option.value === value)?.label ?? value
}

/** Maps StorySetupInput back to teacher-facing form fields for editing. */
export function mapStorySetupInputToFormValues(input: StorySetupInput): StorySetupFormValues {
  const { title, additionalNotes } = parseTitleFromNotes(input.notes)
  const { mainCharacters, additionalCharacters } = parseCharactersFromInput(input.characters)

  return {
    lessonGoal: input.lessonGoal,
    learningObjectives: input.vocabularyFocus,
    vocabularyWords: input.wordsToInclude,
    title,
    theme: input.theme,
    setting: input.setting,
    ageRange: input.ageRange,
    language: input.language,
    pageCount: String(input.pageCount),
    mainCharacters,
    additionalCharacters,
    majorEvents: input.mainEvents,
    additionalNotes,
  }
}

/** Maps teacher-facing form fields to the shared StorySetupInput contract. */
export function mapStorySetupFormToInput(values: StorySetupFormValues): StorySetupInput {
  const noteLines = [
    values.title.trim() ? `${WORKING_TITLE_PREFIX}${values.title.trim()}` : '',
    values.additionalNotes.trim(),
  ].filter(Boolean)

  const characterLines = [values.mainCharacters.trim(), values.additionalCharacters.trim()].filter(
    Boolean,
  )

  return {
    storyPurpose: 'Introduce vocabulary',
    storyTone: 'Warm',
    theme: values.theme.trim(),
    setting: values.setting.trim(),
    vocabularyFocus: values.learningObjectives.trim(),
    lessonGoal: values.lessonGoal.trim(),
    mainEvents: values.majorEvents.trim(),
    wordsToInclude: values.vocabularyWords.trim(),
    wordsToAvoid: '',
    pageCount: Number(values.pageCount),
    notes: noteLines.join('\n\n'),
    ageRange: values.ageRange,
    language: values.language,
    characters: characterLines.join('\n'),
  }
}

export interface StorySetupReviewField {
  label: string
  value: string
  multiline?: boolean
}

export interface StorySetupReviewSection {
  title: string
  fields: StorySetupReviewField[]
  events?: string[]
}

export function buildStorySetupReviewSections(setup: StorySetupInput): StorySetupReviewSection[] {
  const { title, additionalNotes } = parseTitleFromNotes(setup.notes)
  const { mainCharacters, additionalCharacters } = parseCharactersFromInput(setup.characters)
  const events = setup.mainEvents
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const display = (value: string) => value.trim() || '—'

  return [
    {
      title: 'Lesson plan',
      fields: [
        { label: 'Lesson goal', value: display(setup.lessonGoal) },
        { label: 'Learning objectives', value: display(setup.vocabularyFocus), multiline: true },
        { label: 'Vocabulary words', value: display(setup.wordsToInclude) },
      ],
    },
    {
      title: 'Story details',
      fields: [
        { label: 'Title', value: display(title) },
        { label: 'Theme', value: display(setup.theme) },
        { label: 'Setting', value: display(setup.setting) },
        { label: 'Age range', value: display(getAgeRangeLabel(setup.ageRange)) },
        { label: 'Language', value: display(setup.language) },
        { label: 'Page count', value: `${setup.pageCount} pages` },
      ],
    },
    {
      title: 'Characters',
      fields: [
        { label: 'Main characters', value: display(mainCharacters), multiline: true },
        { label: 'Additional characters', value: display(additionalCharacters), multiline: true },
      ],
    },
    {
      title: 'Story flow',
      fields: [],
      events,
    },
    {
      title: 'Notes',
      fields: [{ label: 'Additional notes', value: display(additionalNotes), multiline: true }],
    },
  ]
}
