import { EmptyState, type EmptyStateProps } from '@/shared/components'

export type StoryEmptyStateProps = Omit<EmptyStateProps, 'layout' | 'showIcon'>

/** Story empty card — uses the shared {@link EmptyState} card layout. */
export function StoryEmptyState(props: StoryEmptyStateProps) {
  return <EmptyState layout="card" showIcon {...props} />
}
