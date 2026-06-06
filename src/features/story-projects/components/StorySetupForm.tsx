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
import { storyPurposeOptions, storyToneOptions } from '../config/setupFormOptions'
import type { StorySetupFormErrors } from '../types/storySetupForm.types'
import { NeedIdeasButton } from './NeedIdeasButton'
import { SetupFieldChrome } from './SetupFieldChrome'

interface StorySetupFormProps {
  storyPurpose: string
  onStoryPurposeChange: (value: string) => void
  storyTone: string
  onStoryToneChange: (value: string) => void
  mainEvents: string
  onMainEventsChange: (value: string) => void
  wordsToInclude: string
  onWordsToIncludeChange: (value: string) => void
  wordsToAvoid: string
  onWordsToAvoidChange: (value: string) => void
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
  errors: StorySetupFormErrors
  isSubmitting: boolean
  submitButtonLabel: string
  submitHelperText: string
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

export function StorySetupForm({
  storyPurpose,
  onStoryPurposeChange,
  storyTone,
  onStoryToneChange,
  mainEvents,
  onMainEventsChange,
  wordsToInclude,
  onWordsToIncludeChange,
  wordsToAvoid,
  onWordsToAvoidChange,
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
  errors,
  isSubmitting,
  submitButtonLabel,
  submitHelperText,
  onSubmit,
  onCancel,
}: StorySetupFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5" noValidate>
      <SectionCard
        title="Your lesson goal"
        description="Help us match the story to what you are teaching today."
      >
        <div className="space-y-5">
          <AppSelect
            label="Why are you making this story?"
            value={storyPurpose}
            onChange={(e) => onStoryPurposeChange(e.target.value)}
            options={storyPurposeOptions}
            hint="Introduce words, review words, prepare for a trip, and more."
          />

          <AppSelect
            label="How should it feel when you read aloud?"
            value={storyTone}
            onChange={(e) => onStoryToneChange(e.target.value)}
            options={storyToneOptions}
            hint="Warm, funny, calm, adventurous, or classroom-friendly."
          />

          <SetupFieldChrome
            label="What happens in the story?"
            required
            ideasButton
            ideasButtonSlot={<NeedIdeasButton />}
          >
            <AppTextarea
              value={mainEvents}
              onChange={(e) => onMainEventsChange(e.target.value)}
              hint="One event per line. Aim for 3–5 moments."
              error={errors.mainEvents}
              aria-label="What happens in the story?"
            />
          </SetupFieldChrome>
        </div>
      </SectionCard>

      <SectionCard
        title="Where the story happens"
        description="Give students a place they can picture."
      >
        <div className="space-y-5">
          <SetupFieldChrome label="What is the story about?" required ideasButton ideasButtonSlot={<NeedIdeasButton />}>
            <AppInput
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              hint="The big idea — friendship, helping others, trying something new."
              error={errors.theme}
              aria-label="What is the story about?"
            />
          </SetupFieldChrome>

          <SetupFieldChrome label="Where does it take place?" required ideasButton ideasButtonSlot={<NeedIdeasButton />}>
            <AppInput
              value={setting}
              onChange={(e) => onSettingChange(e.target.value)}
              hint="School, market, park, home, or somewhere familiar."
              error={errors.setting}
              aria-label="Where does it take place?"
            />
          </SetupFieldChrome>
        </div>
      </SectionCard>

      <SectionCard
        title="Words for students to learn"
        description="Tell us what language you want woven into the story."
      >
        <div className="space-y-5">
          <SetupFieldChrome
            label="Which words or topics should we focus on?"
            required
            ideasButton
            ideasButtonSlot={<NeedIdeasButton />}
          >
            <AppInput
              value={vocabularyFocus}
              onChange={(e) => onVocabularyFocusChange(e.target.value)}
              hint="Food, colors, greetings — keep it simple for young learners."
              error={errors.vocabularyFocus}
              aria-label="Which words or topics should we focus on?"
            />
          </SetupFieldChrome>

          <SetupFieldChrome label="What should students be able to do after reading?" required>
            <AppInput
              value={learningGoal}
              onChange={(e) => onLearningGoalChange(e.target.value)}
              hint="For example: use 4–6 new words in short sentences."
              error={errors.learningGoal}
              aria-label="What should students be able to do after reading?"
            />
          </SetupFieldChrome>

          <div className="grid gap-5 sm:grid-cols-2">
            <SetupFieldChrome label="Words to include" optional>
              <AppInput
                value={wordsToInclude}
                onChange={(e) => onWordsToIncludeChange(e.target.value)}
                hint="Optional. Comma-separated."
                aria-label="Words to include"
              />
            </SetupFieldChrome>

            <SetupFieldChrome label="Words to avoid" optional>
              <AppInput
                value={wordsToAvoid}
                onChange={(e) => onWordsToAvoidChange(e.target.value)}
                hint="Optional. Comma-separated."
                aria-label="Words to avoid"
              />
            </SetupFieldChrome>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="How long should it be?"
        description="Shorter stories work well for younger classes."
      >
        <SetupFieldChrome label="Number of pages" required>
          <AppSelect
            value={pageCount}
            onChange={(e) => onPageCountChange(e.target.value)}
            options={pageCountOptions}
            hint="5 pages is a good starting point for ages 4–6."
            error={errors.pageCount}
            aria-label="Number of pages"
          />
        </SetupFieldChrome>
      </SectionCard>

      <SectionCard
        title="Anything else?"
        description="Optional notes about your class, culture, or characters."
      >
        <div className="space-y-5">
          <SetupFieldChrome label="Notes for the story" optional>
            <AppTextarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              hint="Characters, pacing, or anything special about your students."
              aria-label="Notes for the story"
            />
          </SetupFieldChrome>

          <div className="rounded-lg bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">
            <p className="font-medium text-stone-700">About Nina & Nino in pictures</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {ninaNinoSeries.visualContinuityNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-between">
        <AppButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Back to Dashboard
        </AppButton>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AppButton type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating your story…' : submitButtonLabel}
          </AppButton>
          <p className="text-xs text-stone-500 sm:text-right">{submitHelperText}</p>
        </div>
      </div>
    </form>
  )
}
