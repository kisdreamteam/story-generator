import { LoadingCard, type LoadingCardProps } from './LoadingCard'

export interface LoadingGridProps {
  count?: number
  layout?: 'list' | 'grid'
  columns?: 1 | 2 | 3
  cardVariant?: LoadingCardProps['variant']
  showAction?: boolean
  /** Accessible label for the group. */
  ariaLabel?: string
  className?: string
}

const gridColumnClasses: Record<NonNullable<LoadingGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

export function LoadingGrid({
  count = 3,
  layout = 'list',
  columns = 2,
  cardVariant = 'default',
  showAction = true,
  ariaLabel = 'Loading items',
  className = '',
}: LoadingGridProps) {
  const layoutClass =
    layout === 'list' ? 'space-y-3' : `grid gap-3 ${gridColumnClasses[columns]}`

  return (
    <ul className={`${layoutClass} ${className}`.trim()} aria-label={ariaLabel}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <LoadingCard variant={cardVariant} showAction={showAction} />
        </li>
      ))}
    </ul>
  )
}
