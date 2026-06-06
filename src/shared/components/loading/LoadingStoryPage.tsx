import { LoadingText } from './LoadingText'
import { skeletonBlockClass } from './skeletonClasses'
import {
  draftLoadingCopy,
  storyDetailLoadingCopy,
  storyGenerationLoadingCopy,
} from './presets'

export type LoadingStoryPageVariant = 'generation' | 'draft' | 'detail' | 'default'

export interface LoadingStoryPageProps {
  variant?: LoadingStoryPageVariant
  title?: string
  description?: string
  statusLabel?: string
  showHeader?: boolean
  className?: string
}

function StoryPageSkeletonBlocks({ pageCount = 3 }: { pageCount?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: pageCount }, (_, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-stone-100 bg-stone-50/50 p-4">
          <LoadingText width="short" size="sm" />
          <LoadingText width="full" size="sm" lines={3} />
        </div>
      ))}
    </div>
  )
}

function DraftFormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-2">
          <LoadingText width="short" size="sm" />
          <div className={`${skeletonBlockClass} h-10 w-full rounded-lg`} />
        </div>
      ))}
      <div className={`${skeletonBlockClass} h-10 w-full rounded-lg sm:w-40`} />
    </div>
  )
}

function resolveCopy(variant: LoadingStoryPageVariant, props: LoadingStoryPageProps) {
  if (variant === 'generation') {
    return {
      title: props.title ?? storyGenerationLoadingCopy.title,
      description: props.description ?? storyGenerationLoadingCopy.description,
      statusLabel: props.statusLabel ?? storyGenerationLoadingCopy.statusLabel,
    }
  }

  if (variant === 'draft') {
    return {
      title: props.title ?? draftLoadingCopy.title,
      description: props.description ?? draftLoadingCopy.description,
      statusLabel: props.statusLabel ?? draftLoadingCopy.statusLabel,
    }
  }

  if (variant === 'detail') {
    return {
      title: props.title ?? storyDetailLoadingCopy.title,
      description: props.description ?? storyDetailLoadingCopy.description,
      statusLabel: props.statusLabel ?? storyDetailLoadingCopy.statusLabel,
    }
  }

  return {
    title: props.title ?? storyDetailLoadingCopy.title,
    description: props.description ?? storyDetailLoadingCopy.description,
    statusLabel: props.statusLabel ?? storyDetailLoadingCopy.statusLabel,
  }
}

export function LoadingStoryPage({
  variant = 'default',
  showHeader = true,
  className = '',
  ...copyProps
}: LoadingStoryPageProps) {
  const copy = resolveCopy(variant, copyProps)

  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white px-4 py-8 sm:px-6 sm:py-10 ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={copy.statusLabel}
    >
      {showHeader ? (
        <div className="mb-6 space-y-2 text-center sm:mb-8">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">{copy.title}</h2>
          {copy.description ? (
            <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-600">
              {copy.description}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="sr-only">
          {copy.title}. {copy.description}
        </p>
      )}

      {variant === 'generation' ? (
        <StoryPageSkeletonBlocks pageCount={3} />
      ) : null}

      {variant === 'draft' ? <DraftFormSkeleton /> : null}

      {variant === 'detail' || variant === 'default' ? (
        <div className="space-y-6" aria-hidden="true">
          <LoadingText width="medium" size="xl" className="mx-auto max-w-sm" />
          <LoadingText width="long" size="sm" className="mx-auto max-w-md" />
          <StoryPageSkeletonBlocks pageCount={2} />
        </div>
      ) : null}
    </div>
  )
}
