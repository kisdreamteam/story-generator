import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  SectionCard,
  TeacherHelperNote,
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
  /** Fired when the teacher edits any field — used for unsaved navigation guards. */
  onValuesChange?: (values: StorySetupFormValues) => void
}

export function StorySetupForm({ initialValues, onSubmit, onValuesChange }: StorySetupFormProps) {
  const [values, setValues] = useState<StorySetupFormValues>(
    initialValues ?? storySetupFormDefaults,
  )

  function updateField<K extends keyof StorySetupFormValues>(field: K, value: StorySetupFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      onValuesChange?.(next)
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(mapStorySetupFormToInput(values))
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5 px-1 sm:px-0">
      <TeacherHelperNote>
        Your answers shape the story. You can revise your plan anytime before you generate — nothing
        is final until you save a finished story.
      </TeacherHelperNote>

      <SectionCard
        title="Lesson goals"
        description="Tie the story to what you are teaching this week."
      >
        <div className="space-y-4">
          <AppInput
            label="Lesson goal"
            value={values.lessonGoal}
            onChange={(e) => updateField('lessonGoal', e.target.value)}
            hint="One sentence — what should students take away from this story?"
          />
          <AppTextarea
            label="Learning objectives"
            value={values.learningObjectives}
            onChange={(e) => updateField('learningObjectives', e.target.value)}
            hint="What students should be able to do after reading — list 2–4 skills or ideas."
          />
          <AppInput
            label="Vocabulary words"
            value={values.vocabularyWords}
            onChange={(e) => updateField('vocabularyWords', e.target.value)}
            hint="Words you want students to hear and learn — separate with commas."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Story details"
        description="Sets the reading level, length, and story world."
      >
        <div className="space-y-4">
          <AppInput
            label="Title"
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
            hint="A working title helps students connect to the lesson — you can change it later."
          />
          <AppInput
            label="Theme"
            value={values.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            hint="The lesson idea in story form — e.g. kindness, sharing, or trying again."
          />
          <AppInput
            label="Setting"
            value={values.setting}
            onChange={(e) => updateField('setting', e.target.value)}
            hint="Where it happens — classroom, home, park, or a story world."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AppSelect
              label="Age range"
              value={values.ageRange}
              onChange={(e) => updateField('ageRange', e.target.value)}
              options={ageGroupOptions}
              hint="Guides reading level and sentence length."
            />
            <AppSelect
              label="Language"
              value={values.language}
              onChange={(e) => updateField('language', e.target.value)}
              options={languageOptions}
              hint="The language your students will read."
            />
          </div>
          <AppSelect
            label="Page count"
            value={values.pageCount}
            onChange={(e) => updateField('pageCount', e.target.value)}
            options={storyPageCountOptions}
            hint="Shorter for younger classes; longer for shared reading time."
          />
        </div>
      </SectionCard>

      <SectionCard title="Characters" description="Give the story people your students can follow.">
        <div className="space-y-4">
          <AppTextarea
            label="Main characters"
            value={values.mainCharacters}
            onChange={(e) => updateField('mainCharacters', e.target.value)}
            hint="Who drives the plot — names and a brief trait help, e.g. Nina, curious and kind."
          />
          <AppTextarea
            label="Additional characters"
            value={values.additionalCharacters}
            onChange={(e) => updateField('additionalCharacters', e.target.value)}
            hint="Optional — classmates, family, teachers, or friends who appear in scenes."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Story flow"
        description="The main plot points — the story will connect them in order."
      >
        <AppTextarea
          label="Major events"
          value={values.majorEvents}
          onChange={(e) => updateField('majorEvents', e.target.value)}
          hint="One event per line, in order. Aim for 3–6 key moments."
        />
      </SectionCard>

      <SectionCard title="Additional notes" description="Optional — anything else the story should respect.">
        <AppTextarea
          label="Notes"
          value={values.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          hint="Tone, culture, pacing, or things to include or avoid."
        />
      </SectionCard>

      <div className="flex justify-end pt-2 pb-1">
        <AppButton type="submit" size="lg" fullWidth className="sm:w-auto">
          Continue to review
        </AppButton>
      </div>
    </form>
  )
}
