import { AppButton } from '@/shared/components'
import { FlashcardCarousel } from '@/features/story-reader/components/FlashcardCarousel'
import type { StoryFlashcard } from '@/features/stories/types'

interface StudentStoryFlashcardsViewProps {
  cards: StoryFlashcard[]
  onBackToStory: () => void
  backLabel?: string
}

export function StudentStoryFlashcardsView({
  cards,
  onBackToStory,
  backLabel = 'Back to story',
}: StudentStoryFlashcardsViewProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-6">
      <header className="rounded-3xl bg-white px-5 py-6 text-center shadow-sm sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Word time</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Learn these words
        </h2>
        <p className="mt-2 text-base text-stone-600">Tap a card to flip it over.</p>
      </header>

      <FlashcardCarousel cards={cards} />

      <div className="flex justify-center pb-2">
        <AppButton type="button" variant="secondary" onClick={onBackToStory} className="min-w-44">
          {backLabel}
        </AppButton>
      </div>
    </article>
  )
}
