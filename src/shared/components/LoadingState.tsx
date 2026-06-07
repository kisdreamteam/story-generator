import { panelShellClass } from '@/shared/styles/surfaceClasses'
import { LoadingText } from './loading/LoadingText'
import { skeletonBlockClass } from './loading/skeletonClasses'

interface LoadingStateProps {
  title?: string
  description?: string
  size?: 'sm' | 'md'
  className?: string
}

/** Panel-style loading — prefer `LoadingStoryPage` / `LoadingDashboard` for page layouts. */
export function LoadingState({
  title = 'Loading…',
  description = 'Please wait while we get things ready.',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  const padding = size === 'sm' ? 'px-4 py-8' : 'px-6 py-12'
  const titleClass = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div
      className={`${panelShellClass} text-center ${padding} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div
        className={`${skeletonBlockClass} mx-auto mb-4 rounded-full ${
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
        }`}
        aria-hidden="true"
      />
      <h2 className={`font-semibold text-stone-900 ${titleClass}`}>{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">{description}</p>
      ) : null}
      <LoadingText width="long" size="sm" className="mx-auto mt-6 max-w-xs" />
    </div>
  )
}

export { storyGenerationLoadingProps } from './loading/presets'
