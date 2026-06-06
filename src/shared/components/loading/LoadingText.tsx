import { skeletonBlockClass, skeletonLineHeights, skeletonLineWidths } from './skeletonClasses'

type LoadingTextSize = keyof typeof skeletonLineHeights
type LoadingTextWidth = keyof typeof skeletonLineWidths

export interface LoadingTextProps {
  /** Number of placeholder lines (default 1). */
  lines?: number
  width?: LoadingTextWidth
  size?: LoadingTextSize
  className?: string
}

export function LoadingText({
  lines = 1,
  width = 'full',
  size = 'md',
  className = '',
}: LoadingTextProps) {
  return (
    <div className={`space-y-2 ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => {
        const lineWidth =
          lines > 1 && index === lines - 1 && width === 'full' ? 'long' : width

        return (
          <div
            key={index}
            className={`${skeletonBlockClass} ${skeletonLineHeights[size]} ${skeletonLineWidths[lineWidth]}`}
          />
        )
      })}
    </div>
  )
}
