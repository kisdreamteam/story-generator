import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  ErrorState,
  SectionCard,
  TeacherHelperNote,
} from '@/shared/components'
import { insetBannerClass } from '@/shared/styles/surfaceClasses'
import { dashboardPageShellClass } from '@/shared/styles/pageShellClasses'
import type { StorySetupInput } from '../types'
import {
  getAgeGroupOptions,
  getLanguageOptions,
  getStorySetupFormDefaults,
  hasStorySetupFormErrors,
  mapStorySetupFormToInput,
  storyPageCountOptions,
  validateFastStorySetupForm,
  type StorySetupFormErrors,
  type StorySetupFormValues,
} from '../utils/storySetupForm'

interface StorySetupFormProps {
  initialValues?: StorySetupFormValues
  onSubmit: (data: StorySetupInput) => void
  onSavePlan?: () => void
  /** Fired when the teacher edits any field — used for unsaved navigation guards. */
  onValuesChange?: (values: StorySetupFormValues) => void
  isGenerating?: boolean
  isSavingPlan?: boolean
}

export function StorySetupForm({
  initialValues,
  onSubmit,
  onSavePlan,
  onValuesChange,
  isGenerating = false,
  isSavingPlan = false,
}: StorySetupFormProps) {
  const [values, setValues] = useState<StorySetupFormValues>(
    initialValues ?? getStorySetupFormDefaults(),
  )
  const [errors, setErrors] = useState<StorySetupFormErrors>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  function updateField<K extends keyof StorySetupFormValues>(field: K, value: StorySetupFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      onValuesChange?.(next)
      return next
    })

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validateFastStorySetupForm(values)

    if (hasStorySetupFormErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    onSubmit(mapStorySetupFormToInput(values))
  }

  function handleSavePlanClick() {
    onSavePlan?.()
  }

  const isBusy = isGenerating || isSavingPlan

  return (
    <form onSubmit={handleSubmit} className={`${dashboardPageShellClass} space-y-6`}>
      <TeacherHelperNote>
        Example lesson text is pre-filled — replace it with your own or generate right away to see
        how it works. Optional details stay in Advanced options; Nina and Nino apply when characters
        are left blank.
      </TeacherHelperNote>

      <SectionCard
        title="Story basics"
        description="Required — enough to generate a classroom-ready first draft."
      >
        <div className="space-y-4">
          <AppInput
            label="Lesson goal"
            value={values.lessonGoal}
            onChange={(e) => updateField('lessonGoal', e.target.value)}
            hint="One sentence — what should students take away?"
            error={errors.lessonGoal}
          />
          <AppInput
            label="Theme"
            value={values.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            hint="The main idea — e.g. kindness, fire safety, trying again."
            error={errors.theme}
          />
          <AppInput
            label="Setting"
            value={values.setting}
            onChange={(e) => updateField('setting', e.target.value)}
            hint="Where it happens — classroom, park, fire station, etc."
            error={errors.setting}
          />
          <AppTextarea
            label="Story moments"
            value={values.majorEvents}
            onChange={(e) => updateField('majorEvents', e.target.value)}
            hint="One moment per line, in order. Aim for 3–6 key beats."
            error={errors.majorEvents}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AppSelect
              label="Age range"
              value={values.ageRange}
              onChange={(e) => updateField('ageRange', e.target.value)}
              options={getAgeGroupOptions()}
              hint="Guides reading level."
            />
            <AppSelect
              label="Language"
              value={values.language}
              onChange={(e) => updateField('language', e.target.value)}
              options={getLanguageOptions()}
            />
          </div>
          <AppSelect
            label="Page count"
            value={values.pageCount}
            onChange={(e) => updateField('pageCount', e.target.value)}
            options={storyPageCountOptions}
            hint="Shorter for younger classes; longer for shared reading."
            error={errors.pageCount}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Advanced options"
        description="Optional — vocabulary, characters, title, and notes for finer control."
        className={showAdvanced ? undefined : 'bg-stone-50/50'}
        badge={
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((current) => !current)}
            className="shrink-0"
          >
            {showAdvanced ? 'Hide options' : 'Show options'}
          </AppButton>
        }
      >
        {showAdvanced ? (
          <div className="space-y-4 border-t border-stone-100 pt-4">
            <AppInput
              label="Working title"
              value={values.title}
              onChange={(e) => updateField('title', e.target.value)}
              hint="Optional — the AI may suggest a title if left blank."
            />
            <AppTextarea
              label="Learning objectives"
              value={values.learningObjectives}
              onChange={(e) => updateField('learningObjectives', e.target.value)}
              hint="Skills or ideas students should practice — 2–4 items."
            />
            <AppInput
              label="Vocabulary words"
              value={values.vocabularyWords}
              onChange={(e) => updateField('vocabularyWords', e.target.value)}
              hint="Words to include — separate with commas."
            />
            <AppTextarea
              label="Main characters"
              value={values.mainCharacters}
              onChange={(e) => updateField('mainCharacters', e.target.value)}
              hint="Defaults to Nina and Nino when empty."
            />
            <AppTextarea
              label="Additional characters"
              value={values.additionalCharacters}
              onChange={(e) => updateField('additionalCharacters', e.target.value)}
              hint="Teachers, family, or classmates who appear in scenes."
            />
            <AppTextarea
              label="Additional notes"
              value={values.additionalNotes}
              onChange={(e) => updateField('additionalNotes', e.target.value)}
              hint="Tone, culture, pacing, or things to include or avoid."
            />
          </div>
        ) : (
          <div className={`px-3 py-2.5 ${insetBannerClass}`}>
            <p className="text-sm leading-relaxed text-stone-600">
              Expand to add vocabulary lists, custom characters, a working title, or teacher notes.
            </p>
          </div>
        )}
      </SectionCard>

      {Object.keys(errors).length > 0 && (
        <ErrorState
          variant="inline"
          tone="warning"
          title="Check the required fields"
          description="Add the missing story basics above before generating."
        />
      )}

      <div className="flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end">
        <AppButton
          type="submit"
          size="lg"
          fullWidth
          className="order-1 sm:order-2 sm:w-auto"
          disabled={isBusy}
        >
          {isGenerating ? 'Creating story…' : 'Generate story'}
        </AppButton>
        {onSavePlan ? (
          <AppButton
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            className="order-2 sm:order-1 sm:w-auto"
            disabled={isBusy}
            onClick={handleSavePlanClick}
          >
            {isSavingPlan ? 'Saving plan…' : 'Save plan for later'}
          </AppButton>
        ) : null}
      </div>
    </form>
  )
}
