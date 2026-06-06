import { SectionCard } from '@/shared/components'
import { displayDetailValue } from '../../utils/storyDetailView'
import { StoryDetailSectionFallback } from './StoryDetailSectionFallback'
import type { StoryDetailField, StoryDetailSetupSection, StoryMetadataProps } from './types'

function ReviewFieldGrid({ fields }: { fields: StoryDetailField[] }) {
  if (fields.length === 0) return null

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="rounded-lg bg-stone-50 px-3 py-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{field.label}</dt>
          <dd
            className={`mt-1 text-sm text-stone-800 ${field.multiline ? 'whitespace-pre-line' : ''}`}
          >
            {displayDetailValue(field.value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function MainEventsList({ events }: { events: string[] }) {
  if (events.length === 0) {
    return (
      <StoryDetailSectionFallback message="No main events were listed for this story plan." />
    )
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

function SetupSections({ sections }: { sections: StoryDetailSetupSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-900">{section.title}</h3>
          {section.events && <MainEventsList events={section.events} />}
          <ReviewFieldGrid fields={section.fields} />
        </section>
      ))}
    </div>
  )
}

export function StoryMetadata({
  createdAtLabel,
  updatedAtLabel,
  theme,
  pageCount,
  setupSections,
  setupFields,
}: StoryMetadataProps) {
  const hasSetupContent = Boolean(setupSections?.length || setupFields?.length)

  return (
    <div className="space-y-8">
      <SectionCard
        title="Story details"
        description="When this story was saved and the topic you planned for class."
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-stone-50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Created</dt>
            <dd className="mt-1 text-stone-800">{createdAtLabel}</dd>
          </div>
          <div className="rounded-lg bg-stone-50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Last updated</dt>
            <dd className="mt-1 text-stone-800">{updatedAtLabel}</dd>
          </div>
          <div className="rounded-lg bg-stone-50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Topic</dt>
            <dd className="mt-1 text-stone-800">{displayDetailValue(theme)}</dd>
          </div>
          <div className="rounded-lg bg-stone-50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Planned pages
            </dt>
            <dd className="mt-1 text-stone-800">{pageCount > 0 ? pageCount : 'Not set'}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Your lesson plan"
        description="What you planned before creating this story."
      >
        {hasSetupContent ? (
          setupSections?.length ? (
            <SetupSections sections={setupSections} />
          ) : (
            <ReviewFieldGrid fields={setupFields ?? []} />
          )
        ) : (
          <StoryDetailSectionFallback message="No lesson plan details were saved with this story yet. Open it in the creator to add your plan." />
        )}
      </SectionCard>
    </div>
  )
}
