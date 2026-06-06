import { AppButton } from '@/shared/components'

interface StudentActivityPlaceholderProps {
  emoji: string
  title: string
  description: string
  onBack: () => void
}

export function StudentActivityPlaceholder({
  emoji,
  title,
  description,
  onBack,
}: StudentActivityPlaceholderProps) {
  return (
    <article className="mx-auto w-full max-w-lg space-y-6">
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm sm:px-8">
        <span className="text-5xl" aria-hidden>
          {emoji}
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-stone-900 sm:text-3xl">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{description}</p>
        <p className="mt-6 text-sm text-stone-500">This activity is coming soon.</p>
      </div>

      <div className="flex justify-center pb-2">
        <AppButton type="button" variant="secondary" onClick={onBack} className="min-w-44">
          Back to activities
        </AppButton>
      </div>
    </article>
  )
}
