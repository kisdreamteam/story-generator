import { getPageCountLabel } from '../config/formOptions'
import type { SetupReviewField, SetupReviewSection, SetupReviewValues } from '../types/storySetupForm.types'

function optionalReviewField(
  label: string,
  value: string,
  multiline = false,
): SetupReviewField[] {
  if (!value.trim()) return []
  return [{ label, value: value.trim(), multiline }]
}

function formatPageCount(pageCount: string): string {
  return getPageCountLabel(pageCount)
}

function parseMainEvents(mainEvents: string): string[] {
  return mainEvents
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildSetupReviewSections(values: SetupReviewValues): SetupReviewSection[] {
  const sections: SetupReviewSection[] = [
    {
      title: 'Lesson plan',
      description: 'Why you are creating this story and what students should learn.',
      fields: [
        { label: 'Purpose', value: values.storyPurpose },
        { label: 'Tone', value: values.storyTone },
        { label: 'Learning goal', value: values.learningGoal },
        { label: 'Vocabulary focus', value: values.vocabularyFocus },
      ],
    },
    {
      title: 'Story details',
      description: 'The world your students will picture.',
      fields: [
        { label: 'Theme', value: values.theme },
        { label: 'Setting', value: values.setting },
        { label: 'Length', value: formatPageCount(values.pageCount) },
      ],
    },
    {
      title: 'What happens in the story',
      description: 'The moments you asked us to include.',
      fields: [],
      events: parseMainEvents(values.mainEvents),
    },
  ]

  const wordFields = [
    ...optionalReviewField('Words to include', values.wordsToInclude),
    ...optionalReviewField('Words to avoid', values.wordsToAvoid),
  ]

  if (wordFields.length > 0) {
    sections.push({
      title: 'Word choices',
      description: 'Optional words you listed.',
      fields: wordFields,
    })
  }

  const noteFields = optionalReviewField('Notes', values.notes, true)
  if (noteFields.length > 0) {
    sections.push({
      title: 'Anything else',
      fields: noteFields,
    })
  }

  return sections
}
