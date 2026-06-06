import { AppCard } from '@/shared/components'

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
            Edit mode
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
    <AppCard padding="sm" className="border-stone-200 bg-stone-50/80" role="status">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <span className="w-fit rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
          Read mode
        </span>
        <p className="text-sm leading-relaxed text-stone-600">
          Scroll through your story, vocabulary, and illustration notes.
        </p>
      </div>
    </AppCard>
  )
}
