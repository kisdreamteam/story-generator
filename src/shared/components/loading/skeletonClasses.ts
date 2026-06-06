/** Shared pulse skeleton styling — respects reduced-motion preferences. */
export const skeletonBlockClass = 'rounded bg-stone-200/80 animate-pulse motion-reduce:animate-none'

export const skeletonLineHeights = {
  xs: 'h-3',
  sm: 'h-3.5',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-8',
} as const

export const skeletonLineWidths = {
  full: 'w-full',
  long: 'w-5/6',
  medium: 'w-2/3',
  short: 'w-1/3',
  xs: 'w-1/4',
} as const
