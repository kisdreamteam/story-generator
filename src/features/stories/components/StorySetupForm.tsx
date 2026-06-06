import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  SectionCard,
} from '../../../shared/components'
import type { StorySetupInput } from '../types'
import {
  ageGroupOptions,
  languageOptions,
  mapStorySetupFormToInput,
  storyPageCountOptions,
  storySetupFormDefaults,
  type StorySetupFormValues,
} from '../utils/storySetupForm'

interface StorySetupFormProps {
  initialValues?: StorySetupFormValues
  onSubmit: (data: StorySetupInput) => void
}

export function StorySetupForm({ initialValues, onSubmit }: StorySetupFormProps) {
  const [values, setValues] = useState<StorySetupFormValues>(
    initialValues ?? storySetupFormDefaults,
  )

  function updateField<K extends keyof StorySetupFormValues>(field: K, value: StorySetupFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(mapStorySetupFormToInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <SectionCard
        title="Lesson goals"
        description="What students should learn from this story."
      >
        <div className="space-y-4">
          <AppInput
            label="Lesson goal"
            value={values.lessonGoal}
            onChange={(e) => updateField('lessonGoal', e.target.value)}
            hint="The main takeaway for your class."
          />
          <AppTextarea
            label="Learning objectives"
            value={values.learningObjectives}
            onChange={(e) => updateField('learningObjectives', e.target.value)}
            hint="What students should be able to do after reading."
          />
          <AppInput
            label="Vocabulary words"
            value={values.vocabularyWords}
            onChange={(e) => updateField('vocabularyWords', e.target.value)}
            hint="Comma-separated words to weave into the story."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Story details"
        description="Shape the story world and reading length."
      >
        <div className="space-y-4">
          <AppInput
            label="Title"
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
            hint="Working title — you can refine it later."
          />
          <AppInput
            label="Theme"
            value={values.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            hint="The big idea behind the story."
          />
          <AppInput
            label="Setting"
            value={values.setting}
            onChange={(e) => updateField('setting', e.target.value)}
            hint="Where the story takes place."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AppSelect
              label="Age range"
              value={values.ageRange}
              onChange={(e) => updateField('ageRange', e.target.value)}
              options={ageGroupOptions}
            />
            <AppSelect
              label="Language"
              value={values.language}
              onChange={(e) => updateField('language', e.target.value)}
              options={languageOptions}
            />
          </div>
          <AppSelect
            label="Page count"
            value={values.pageCount}
            onChange={(e) => updateField('pageCount', e.target.value)}
            options={storyPageCountOptions}
            hint="How many pages the story should have."
          />
        </div>
      </SectionCard>

      <SectionCard title="Characters" description="Who appears in the story.">
        <div className="space-y-4">
          <AppTextarea
            label="Main characters"
            value={values.mainCharacters}
            onChange={(e) => updateField('mainCharacters', e.target.value)}
            hint="Lead characters — e.g. Nina and Nino."
          />
          <AppTextarea
            label="Additional characters"
            value={values.additionalCharacters}
            onChange={(e) => updateField('additionalCharacters', e.target.value)}
            hint="Supporting roles such as teachers, family, or friends."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Story flow"
        description="Major events or beats the story should include."
      >
        <AppTextarea
          label="Major events"
          value={values.majorEvents}
          onChange={(e) => updateField('majorEvents', e.target.value)}
          hint="One event per line. Aim for 3–6 key moments."
        />
      </SectionCard>

      <SectionCard title="Additional notes" description="Anything else the story should respect.">
        <AppTextarea
          label="Notes"
          value={values.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          hint="Tone, culture, pacing, or classroom constraints."
        />
      </SectionCard>

      <div className="flex justify-end pt-1">
        <AppButton type="submit" size="lg">
          Save story setup
        </AppButton>
      </div>
    </form>
  )
}
