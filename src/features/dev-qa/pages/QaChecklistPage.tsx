import { Link } from 'react-router-dom'
import { LocalStoryMigrationPrompt } from '@/app/components/LocalStoryMigrationPrompt'
import { StorageStatusIndicator } from '@/app/components/StorageStatusIndicator'
import { AppButton, PageHeader, SectionCard } from '@/shared/components'
import { QA_CHECKLIST_ITEMS } from '../config/qaChecklist'
import { useQaChecklist } from '../hooks'

export function QaChecklistPage() {
  const { completedCount, totalCount, isChecked, toggleItem, resetChecklist } = useQaChecklist()
  const allComplete = completedCount === totalCount

  return (
    <>
      <PageHeader
        title="QA checklist"
        description="Internal manual test list for release checks. Not for classroom use."
      />

      <div className="mx-auto max-w-3xl space-y-6 px-1 sm:px-0">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Dev / internal only</p>
          <p className="mt-1 text-amber-900">
            This page is for team QA. Progress saves in this browser only. Route:{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">/dashboard/dev/qa</code>
          </p>
        </div>

        <SectionCard
          title="Progress"
          description={`${completedCount} of ${totalCount} areas checked${allComplete ? ' — all done' : ''}.`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="h-2 flex-1 min-w-[12rem] overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
              aria-label="QA checklist progress"
            >
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${totalCount === 0 ? 0 : (completedCount / totalCount) * 100}%` }}
              />
            </div>
            <AppButton type="button" variant="ghost" size="sm" onClick={resetChecklist}>
              Reset checklist
            </AppButton>
          </div>
        </SectionCard>

        <SectionCard
          title="Live storage signals"
          description="Reference while testing storage status and migration items."
        >
          <div className="space-y-4">
            <StorageStatusIndicator />
            <LocalStoryMigrationPrompt />
          </div>
        </SectionCard>

        <ul className="space-y-4">
          {QA_CHECKLIST_ITEMS.map((item) => {
            const checked = isChecked(item.id)

            return (
              <li
                key={item.id}
                className={checked ? 'rounded-xl ring-2 ring-brand-200 ring-offset-2' : undefined}
              >
                <SectionCard title={item.title} description={item.description}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="flex-1">
                      <span className="text-sm font-medium text-stone-900">
                        Mark as verified
                      </span>
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-stone-700">
                        {item.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                      {item.links && item.links.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.links.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="inline-flex items-center rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:border-brand-200 hover:bg-brand-50"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </span>
                  </label>
                </SectionCard>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
