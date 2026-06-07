import { AppBadge, AppButton } from '@/shared/components'
import type { StoryReaderCoverSlide } from '../types'

interface StoryReaderCoverProps {
  slide: StoryReaderCoverSlide
  onBegin?: () => void
}

export function StoryReaderCover({ slide, onBegin }: StoryReaderCoverProps) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-3xl shadow-lg shadow-brand-200/60">
        📖
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Story reader</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
        {slide.title}
      </h1>

      {slide.summary ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
          {slide.summary}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <AppBadge tone="outline">
          {slide.pageCount} {slide.pageCount === 1 ? 'page' : 'pages'}
        </AppBadge>
        <AppBadge tone="outline">{slide.wordCount} words</AppBadge>
      </div>

      {onBegin ? (
        <AppButton type="button" size="lg" className="mt-10 w-full sm:w-auto" onClick={onBegin}>
          Start reading
        </AppButton>
      ) : null}
    </article>
  )
}
