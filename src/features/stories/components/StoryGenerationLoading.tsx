import { AppCard } from '../../../shared/components'

export function StoryGenerationLoading() {
  return (
    <AppCard padding="lg" className="border-stone-200 bg-stone-50/50 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <div
          className="mx-auto h-8 w-8 animate-pulse rounded-full bg-brand-100"
          aria-hidden
        />
        <h3 className="text-base font-semibold text-stone-900">Creating your story…</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          This is mock loading for now. AI generation will be connected later.
        </p>
      </div>
    </AppCard>
  )
}
