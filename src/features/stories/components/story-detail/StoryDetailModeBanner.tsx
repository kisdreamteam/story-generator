import { AppCard } from '@/shared/components'
import { insetPanelShellClass } from '@/shared/styles/surfaceClasses'

interface StoryDetailModeBannerProps {
  isEditing: boolean
  isDirty?: boolean
}

export function StoryDetailModeBanner({ isEditing, isDirty = false }: StoryDetailModeBannerProps) {
  if (isEditing) {
    return (
      <AppCard
        padding="sm"
        className="border-amber-200 bg-amber-50/80"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="w-fit rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-950">
            Quick edit
          </span>
          <p className="text-sm leading-relaxed text-amber-950">
            {isDirty
              ? 'You have unsaved changes. Save or cancel when you are done.'
              : 'Update pages, vocabulary cards, or illustration notes below.'}
          </p>
        </div>
      </AppCard>
    )
  }

  return (
    <div className={`${insetPanelShellClass} p-3 sm:p-4`} role="status">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <span className="w-fit rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
          Read mode
        </span>
        <p className="text-sm leading-relaxed text-stone-600">
          Scroll through your story below. Use Quick edit for small changes, or Advanced editor for
          page structure and version history.
        </p>
      </div>
    </div>
  )
}
