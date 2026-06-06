import { AppButton, ErrorState, SectionCard, TeacherHelperNote } from '../../../shared/components'
import { SaveStatusIndicator } from '../../../shared/components/SaveStatusIndicator'
import type { SaveStatus } from '@/shared/lib/autosave/saveStatus'
import type { StorySetupInput } from '../types'
import { StoryStatusBadge } from './StoryStatusBadge'
import { buildStorySetupReviewSections, type StorySetupReviewField } from '../utils/storySetupForm'
import { STORY_PLAN_SAVED_LABEL, getStoryStatusLabel } from '../utils/storyStatus'

interface StorySetupReviewProps {
  setupData: StorySetupInput
  onBack: () => void
  onConfirm: () => void
  onSaveDraft?: () => void
  draftSaved?: boolean
  isSavingDraft?: boolean
  isConfirming?: boolean
  draftSaveError?: string | null
  saveStatus?: SaveStatus
}

function ReviewFieldGrid({ fields }: { fields: StorySetupReviewField[] }) {
  if (fields.length === 0) return null

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="rounded-lg bg-stone-50 px-3 py-2.5">
          <dt className="text-xs font-medium text-stone-500">{field.label}</dt>
          <dd
            className={`mt-1 break-words text-sm leading-relaxed text-stone-800 ${field.multiline ? 'whitespace-pre-line' : ''}`}
          >
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function MainEventsList({ events }: { events: string[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-stone-500">No events listed yet.</p>
  }

  return (
    <ol className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/60 p-3 sm:p-4">
      {events.map((event, index) => (
        <li key={`${index}-${event}`} className="flex gap-3 text-sm text-stone-800">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="pt-0.5 leading-relaxed">{event}</span>
        </li>
      ))}
    </ol>
  )
}

export function StorySetupReview({
  setupData,
  onBack,
  onConfirm,
  onSaveDraft,
  draftSaved = false,
  isSavingDraft = false,
  isConfirming = false,
  draftSaveError = null,
  saveStatus = 'idle',
}: StorySetupReviewProps) {
  const isBusy = isSavingDraft || isConfirming
  const sections = buildStorySetupReviewSections(setupData)
  const statusBadgeLabel = draftSaved ? STORY_PLAN_SAVED_LABEL : getStoryStatusLabel('setup-draft')

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-1 sm:px-0">
      <SectionCard
        title="Review your story plan"
        description="Check that everything looks right before you save or generate."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <StoryStatusBadge label={statusBadgeLabel} />
            <SaveStatusIndicator status={saveStatus} />
          </div>
        }
      >
        <TeacherHelperNote className="mb-6">
          <strong className="font-medium text-stone-700">Save story plan</strong> keeps your setup in
          Your stories so you can edit and generate later.{' '}
          <strong className="font-medium text-stone-700">Generate story</strong> writes the pages,
          vocabulary cards, and illustration notes from this plan.
        </TeacherHelperNote>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-900">{section.title}</h3>

              {section.events && <MainEventsList events={section.events} />}

              <ReviewFieldGrid fields={section.fields} />
            </section>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-stone-100 pt-5">
          {draftSaved && !draftSaveError && (
            <ErrorState
              variant="inline"
              tone="info"
              description="Story plan saved to Your stories. Generate when you are ready, or open the plan later to edit and generate."
            />
          )}

          {draftSaveError && (
            <ErrorState
              variant="inline"
              tone="warning"
              title="Could not save your plan"
              description={draftSaveError}
            />
          )}

          <div className="flex flex-col gap-3">
            <AppButton type="button" variant="ghost" onClick={onBack} disabled={isBusy} className="self-start">
              Edit story plan
            </AppButton>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {onSaveDraft && (
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={onSaveDraft}
                  disabled={isBusy}
                  fullWidth
                  className="sm:w-auto"
                >
                  {isSavingDraft ? 'Saving story plan…' : draftSaved ? 'Save story plan again' : 'Save story plan'}
                </AppButton>
              )}
              <AppButton
                type="button"
                size="lg"
                onClick={onConfirm}
                disabled={isBusy}
                fullWidth
                className="sm:w-auto"
              >
                {isConfirming ? 'Creating story…' : 'Generate story'}
              </AppButton>
            </div>
            <TeacherHelperNote variant="subtle" className="sm:text-right">
              After generating, you can edit individual pages, vocabulary, and illustration notes.
              Your original plan stays available if you reopen the story from Your stories.
            </TeacherHelperNote>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
