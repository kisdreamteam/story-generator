import { AppButton, SectionCard } from '../../../shared/components'
import type { SetupReviewField, SetupReviewSection } from '../types/storySetupForm.types'

interface SetupReviewPanelProps {
  sections: SetupReviewSection[]
  isSubmitting: boolean
  submitHelperText: string
  onBackToEdit: () => void
  onConfirmGenerate: () => void
}

function ReviewFieldGrid({ fields }: { fields: SetupReviewField[] }) {
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

export function SetupReviewPanel({
  sections,
  isSubmitting,
  submitHelperText,
  onBackToEdit,
  onConfirmGenerate,
}: SetupReviewPanelProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionCard
        title="Check your story plan"
        description="Everything looks good? Confirm to create your story. You can go back to change anything."
      >
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">{section.title}</h3>
                {section.description && (
                  <p className="mt-0.5 text-xs text-stone-500">{section.description}</p>
                )}
              </div>

              {section.events && section.events.length > 0 && (
                <MainEventsList events={section.events} />
              )}

              <ReviewFieldGrid fields={section.fields} />
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-between">
          <AppButton
            type="button"
            variant="ghost"
            onClick={onBackToEdit}
            disabled={isSubmitting}
          >
            Back to Edit
          </AppButton>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <AppButton
              type="button"
              size="lg"
              onClick={onConfirmGenerate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating your story…' : 'Confirm & Generate'}
            </AppButton>
            <p className="text-xs text-stone-500 sm:text-right">{submitHelperText}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
