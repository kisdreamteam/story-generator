import type { StoryReaderSlideKind, StoryReaderSlideLabel } from '../types'

interface StoryReaderPageIndicatorsProps {
  currentIndex: number
  totalSlides: number
  progressPercent: number
  slideLabels: StoryReaderSlideLabel[]
  onSelectIndex: (index: number) => void
  disabled?: boolean
}

const kindColors: Record<StoryReaderSlideKind, string> = {
  cover: 'bg-brand-500',
  story: 'bg-nina',
  flashcards: 'bg-nino',
  end: 'bg-stone-400',
}

export function StoryReaderPageIndicators({
  currentIndex,
  totalSlides,
  progressPercent,
  slideLabels,
  onSelectIndex,
  disabled = false,
}: StoryReaderPageIndicatorsProps) {
  const currentLabel = slideLabels[currentIndex]?.label ?? `${currentIndex + 1}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-stone-700">
          {currentLabel}{' '}
          <span className="font-normal text-stone-500">
            ({currentIndex + 1} of {totalSlides})
          </span>
        </span>
        <span className="text-stone-500">{progressPercent}%</span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Slide indicators"
      >
        {slideLabels.map((item) => {
          const isActive = item.index === currentIndex

          return (
            <button
              key={item.index}
              type="button"
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => {
                if (disabled) {
                  return
                }

                onSelectIndex(item.index)
              }}
              disabled={disabled}
              className={[
                'h-2.5 shrink-0 rounded-full transition-all',
                isActive ? 'w-6' : 'w-2.5 opacity-50 hover:opacity-80',
                kindColors[item.kind],
              ].join(' ')}
            />
          )
        })}
      </div>
    </div>
  )
}
