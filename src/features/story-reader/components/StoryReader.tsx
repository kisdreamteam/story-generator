import { AppButton } from '@/shared/components'
import { useStoryReader } from '../hooks'
import type { StoryReaderProps, StoryReaderSlide } from '../types'
import { StoryReaderCover } from './StoryReaderCover'
import { StoryReaderEndScreen } from './StoryReaderEndScreen'
import { StoryReaderFlashcards } from './StoryReaderFlashcards'
import { StoryReaderNavigation } from './StoryReaderNavigation'
import { StoryReaderSlideTransition } from './StoryReaderSlideTransition'
import { StoryReaderStoryPage } from './StoryReaderStoryPage'
import { StoryReaderPageIndicators } from './StoryReaderPageIndicators'

function renderSlide(
  slide: StoryReaderSlide,
  story: StoryReaderProps['story'],
  handlers: {
    onBegin: () => void
    onReadAgain: () => void
    onExit?: () => void
  },
) {
  switch (slide.kind) {
    case 'cover':
      return <StoryReaderCover slide={slide} onBegin={handlers.onBegin} />
    case 'story':
      return <StoryReaderStoryPage slide={slide} imagePrompts={story.imagePrompts} />
    case 'flashcards':
      return <StoryReaderFlashcards slide={slide} />
    case 'end':
      return (
        <StoryReaderEndScreen
          slide={slide}
          onReadAgain={handlers.onReadAgain}
          onExit={handlers.onExit}
        />
      )
  }
}

function resolveNextLabel(
  currentSlide: StoryReaderSlide,
  nextSlide: StoryReaderSlide | undefined,
  isLastSlide: boolean,
): string {
  if (currentSlide.kind === 'cover') {
    return 'Start'
  }

  if (isLastSlide) {
    return 'Finish'
  }

  if (nextSlide?.kind === 'flashcards') {
    return 'Vocabulary'
  }

  if (nextSlide?.kind === 'end') {
    return 'Finish'
  }

  return 'Next'
}

export function StoryReader({ story, onComplete, onExit, className = '' }: StoryReaderProps) {
  const reader = useStoryReader(story, { onComplete })
  const nextSlide = reader.slides[reader.currentIndex + 1]
  const nextLabel = resolveNextLabel(reader.currentSlide, nextSlide, reader.isLastSlide)
  const swipeEnabled = reader.currentSlide.kind !== 'flashcards'

  return (
    <div
      className={[
        'flex min-h-[100dvh] flex-col bg-gradient-to-b from-brand-50 via-white to-stone-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{story.title}</p>
            <p className="text-xs text-stone-500">Story reader</p>
          </div>
          {onExit ? (
            <AppButton type="button" variant="ghost" size="sm" onClick={onExit}>
              Exit
            </AppButton>
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <StoryReaderSlideTransition
            slideKey={reader.slideKey}
            direction={reader.direction}
            canGoNext={reader.canGoNext && !reader.isTransitioning}
            canGoPrevious={reader.canGoPrevious && !reader.isTransitioning}
            onSwipeNext={reader.goNext}
            onSwipePrevious={reader.goPrevious}
            onTransitionComplete={reader.onTransitionComplete}
            swipeEnabled={swipeEnabled}
          >
            {renderSlide(reader.currentSlide, story, {
              onBegin: reader.goNext,
              onReadAgain: () => reader.goToIndex(0),
              onExit,
            })}
          </StoryReaderSlideTransition>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-stone-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <StoryReaderPageIndicators
            currentIndex={reader.currentIndex}
            totalSlides={reader.totalSlides}
            progressPercent={reader.progressPercent}
            slideLabels={reader.slideLabels}
            onSelectIndex={reader.goToIndex}
            disabled={reader.isTransitioning}
          />
          <StoryReaderNavigation
            canGoPrevious={reader.canGoPrevious}
            canGoNext={reader.canGoNext}
            onPrevious={reader.goPrevious}
            onNext={reader.goNext}
            nextLabel={nextLabel}
            disabled={reader.isTransitioning}
          />
        </div>
      </footer>
    </div>
  )
}
