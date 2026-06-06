import type { StudentActivityOption } from '../../types'

interface StudentActivityMenuProps {
  activities: StudentActivityOption[]
  onSelect: (activityId: StudentActivityOption['id']) => void
  onBackToStory: () => void
}

export function StudentActivityMenu({
  activities,
  onSelect,
  onBackToStory,
}: StudentActivityMenuProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-6">
      <header className="rounded-3xl bg-white px-5 py-6 text-center shadow-sm sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Story finished</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Choose an activity
        </h2>
        <p className="mt-2 text-base text-stone-600">Pick one to try next.</p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {activities.map((activity) => (
          <li key={activity.id}>
            <button
              type="button"
              onClick={() => onSelect(activity.id)}
              className="flex w-full items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className="text-3xl" aria-hidden>
                {activity.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold text-stone-900">{activity.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-stone-600">
                  {activity.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-center pb-2">
        <button
          type="button"
          onClick={onBackToStory}
          className="text-sm font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
        >
          Back to last page
        </button>
      </div>
    </article>
  )
}
