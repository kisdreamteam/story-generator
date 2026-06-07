export type StoryCreationStep = 'setup' | 'review' | 'generated'

const storyCreationSteps: {
  id: StoryCreationStep
  label: string
  shortLabel: string
  helper: string
}[] = [
  { id: 'setup', label: 'Create story', shortLabel: 'Create', helper: 'Lesson basics' },
  { id: 'review', label: 'Generate', shortLabel: 'Generate', helper: 'Creating pages' },
  { id: 'generated', label: 'Review & refine', shortLabel: 'Refine', helper: 'Edit and save' },
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
    <nav aria-label="Create story progress" className="min-w-0 flex-1">
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
                    'text-sm font-medium leading-snug',
                    isActive && 'text-stone-900',
                    isComplete && 'text-stone-700',
                    isUpcoming && 'text-stone-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="sm:hidden">{step.shortLabel}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                  {isActive && (
                    <span className="mt-0.5 block text-xs font-normal text-stone-500">{step.helper}</span>
                  )}
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
