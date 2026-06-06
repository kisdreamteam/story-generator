import { AppButton } from '@/shared/components'
import type { StoryReaderEndSlide } from '../types'

interface StoryReaderEndScreenProps {
  slide: StoryReaderEndSlide
  onReadAgain?: () => void
  onExit?: () => void
}

export function StoryReaderEndScreen({ slide, onReadAgain, onExit }: StoryReaderEndScreenProps) {
  return (
    <article className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-nino/15 text-4xl">
        ✨
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nino">The end</p>
      <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">Great reading!</h2>
      <p className="mt-3 text-base leading-relaxed text-stone-600">
        You finished <span className="font-medium text-stone-800">{slide.title}</span>.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700 ring-1 ring-stone-200">
          {slide.pageCount} {slide.pageCount === 1 ? 'page' : 'pages'} read
        </span>
        {slide.flashcardCount > 0 ? (
          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700 ring-1 ring-stone-200">
            {slide.flashcardCount} vocabulary {slide.flashcardCount === 1 ? 'word' : 'words'}
          </span>
        ) : null}
      </div>

      <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {onReadAgain ? (
          <AppButton type="button" variant="secondary" fullWidth className="sm:w-auto" onClick={onReadAgain}>
            Read again
          </AppButton>
        ) : null}
        {onExit ? (
          <AppButton type="button" fullWidth className="sm:w-auto" onClick={onExit}>
            Done
          </AppButton>
        ) : null}
      </div>
    </article>
  )
}
