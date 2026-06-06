import { AppButton, AppEmptyState, type AppEmptyStateKind } from '@/shared/components'

export type DashboardLibraryEmptyKind =
  | 'no-stories'
  | 'no-story-plans'
  | 'no-finished-stories'

const KIND_MAP: Record<DashboardLibraryEmptyKind, AppEmptyStateKind> = {
  'no-stories': 'story-library-empty',
  'no-story-plans': 'story-library-no-plans',
  'no-finished-stories': 'story-library-no-finished',
}

interface DashboardLibraryEmptyStateProps {
  kind: DashboardLibraryEmptyKind
  layout?: 'card' | 'section'
  hasStoryPlans?: boolean
  onCreateStory?: () => void
}

/** Dashboard library empty states — delegates to {@link AppEmptyState} presets. */
export function DashboardLibraryEmptyState({
  kind,
  layout,
  hasStoryPlans = false,
  onCreateStory,
}: DashboardLibraryEmptyStateProps) {
  const presetKind = KIND_MAP[kind]
  const useSectionActions =
    layout === 'section' && kind !== 'no-stories' && Boolean(onCreateStory)

  return (
    <div className={useSectionActions ? 'space-y-3' : undefined}>
      <AppEmptyState
        kind={presetKind}
        hasStoryPlans={hasStoryPlans}
        layout={layout}
        onAction={onCreateStory}
        className={layout === 'section' ? 'text-left' : undefined}
      />
      {useSectionActions ? (
        <AppButton type="button" variant="ghost" size="sm" onClick={onCreateStory}>
          {kind === 'no-story-plans' ? 'Start a story plan' : 'Create a story plan'}
        </AppButton>
      ) : null}
    </div>
  )
}
