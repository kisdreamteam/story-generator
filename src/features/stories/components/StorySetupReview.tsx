import { AppButton, SectionCard } from '../../../shared/components'
import type { StorySetupInput } from '../types'
import { buildStorySetupReviewSections, type StorySetupReviewField } from '../utils/storySetupForm'

interface StorySetupReviewProps {
  setupData: StorySetupInput
  onBack: () => void
  onConfirm: () => void
  onSaveDraft?: () => void
  draftSaved?: boolean
}

function ReviewFieldGrid({ fields }: { fields: StorySetupReviewField[] }) {
  if (fields.length === 0) return null

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="rounded-lg bg-stone-50 px-3 py-2.5">
          <dt className="text-xs font-medium text-stone-500">{field.label}</dt>
          <dd
            className={`mt-1 text-sm text-stone-800 ${field.multiline ? 'whitespace-pre-line' : ''}`}
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
    return <p className="text-sm text-stone-500">—</p>
  }

  return (
    <ol className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/60 p-4">
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
}: StorySetupReviewProps) {
  const sections = buildStorySetupReviewSections(setupData)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionCard
        title="Review your story plan"
        description="Check everything below. You can go back to edit or confirm when ready."
      >
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
          {draftSaved && (
            <p className="text-sm text-brand-700" role="status">
              Draft saved on this device.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <AppButton type="button" variant="ghost" onClick={onBack}>
              Back to edit
            </AppButton>
            <div className="flex flex-col gap-2 sm:flex-row">
              {onSaveDraft && (
                <AppButton type="button" variant="secondary" onClick={onSaveDraft}>
                  Save draft
                </AppButton>
              )}
              <AppButton type="button" size="lg" onClick={onConfirm}>
                Confirm story plan
              </AppButton>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
