import type { FormEvent } from 'react'
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  SectionCard,
} from '../../../shared/components'
import { ninaNinoSeries } from '../../series/services/series.service'
import { pageCountOptions } from '../config/formOptions'

interface StorySetupFormProps {
  theme: string
  onThemeChange: (value: string) => void
  setting: string
  onSettingChange: (value: string) => void
  vocabularyFocus: string
  onVocabularyFocusChange: (value: string) => void
  learningGoal: string
  onLearningGoalChange: (value: string) => void
  pageCount: string
  onPageCountChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  isSubmitting: boolean
  submitButtonLabel: string
  submitHelperText: string
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

export function StorySetupForm({
  theme,
  onThemeChange,
  setting,
  onSettingChange,
  vocabularyFocus,
  onVocabularyFocusChange,
  learningGoal,
  onLearningGoalChange,
  pageCount,
  onPageCountChange,
  notes,
  onNotesChange,
  isSubmitting,
  submitButtonLabel,
  submitHelperText,
  onSubmit,
  onCancel,
}: StorySetupFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <SectionCard title="Story Basics" description="Core narrative elements for this adventure">
        <div className="space-y-4">
          <AppInput
            label="Theme"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            hint="The central idea or lesson of the story"
          />

          <AppInput
            label="Setting"
            value={setting}
            onChange={(e) => onSettingChange(e.target.value)}
            hint="Where the story takes place"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Learning Goals"
        description="Vocabulary and language targets for your students"
      >
        <div className="space-y-4">
          <AppInput
            label="Vocabulary Focus"
            value={vocabularyFocus}
            onChange={(e) => onVocabularyFocusChange(e.target.value)}
            hint={ninaNinoSeries.vocabularyLevelNotes}
          />

          <AppInput
            label="Learning Goal"
            value={learningGoal}
            onChange={(e) => onLearningGoalChange(e.target.value)}
            hint="What students should practice or remember"
          />
        </div>
      </SectionCard>

      <SectionCard title="Story Structure" description="Shape the length and pacing of the story">
        <AppSelect
          label="Page Count"
          value={pageCount}
          onChange={(e) => onPageCountChange(e.target.value)}
          options={pageCountOptions}
          hint="Recommended: 5 pages for ages 4–6"
        />
      </SectionCard>

      <SectionCard title="Extra Notes" description="Tone, characters, and illustration guidance">
        <div className="space-y-4">
          <AppTextarea
            label="Additional Notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            hint="Include character notes, tone, or constraints"
          />

          <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
            <p className="font-medium text-stone-700">Series visual continuity</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {ninaNinoSeries.visualContinuityNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <AppButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Back to Dashboard
        </AppButton>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AppButton type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : submitButtonLabel}
          </AppButton>
          <p className="text-xs text-stone-500 sm:text-right">{submitHelperText}</p>
        </div>
      </div>
    </form>
  )
}
