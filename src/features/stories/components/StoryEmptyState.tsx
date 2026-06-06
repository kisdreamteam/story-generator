import { EmptyState, type EmptyStateProps } from '@/shared/components'

export type StoryEmptyStateProps = Omit<EmptyStateProps, 'layout' | 'showIcon'>

/** Story-library empty state — dashed card with optional hints and action. */
export function StoryEmptyState(props: StoryEmptyStateProps) {
  return <EmptyState layout="card" showIcon {...props} />
}
