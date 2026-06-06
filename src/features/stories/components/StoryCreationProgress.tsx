export type StoryCreationStep = 'setup' | 'review' | 'generated'

const storyCreationSteps: { id: StoryCreationStep; label: string }[] = [
  { id: 'setup', label: 'Story setup' },
  { id: 'review', label: 'Review plan' },
  { id: 'generated', label: 'Generated story' },
]

interface StoryCreationProgressProps {
  currentStep: StoryCreationStep
}

function stepIndex(step: StoryCreationStep): number {
  return storyCreationSteps.findIndex((item) => item.id === step)
}

export function StoryCreationProgress({ currentStep }: StoryCreationProgressProps) {
  const activeIndex = stepIndex(currentStep)

  return (
    <nav aria-label="Create story progress" className="mx-auto max-w-2xl">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {storyCreationSteps.map((step, index) => {
          const isComplete = index < activeIndex
          const isActive = index === activeIndex
          const isUpcoming = index > activeIndex

          return (
            <li key={step.id} className="flex items-center gap-3 sm:flex-1">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isActive && 'bg-brand-500 text-white',
                    isComplete && 'bg-brand-100 text-brand-700',
                    isUpcoming && 'bg-stone-100 text-stone-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={[
                    'text-sm font-medium',
                    isActive && 'text-stone-900',
                    isComplete && 'text-stone-700',
                    isUpcoming && 'text-stone-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {index < storyCreationSteps.length - 1 && (
                <div
                  className={[
                    'hidden h-px flex-1 sm:block',
                    index < activeIndex ? 'bg-brand-200' : 'bg-stone-200',
                  ].join(' ')}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
