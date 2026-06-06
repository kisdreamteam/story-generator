import { AppButton, EmptyState } from '@/shared/components'

export type DashboardLibraryEmptyKind =
  | 'no-stories'
  | 'no-story-plans'
  | 'no-finished-stories'

interface DashboardLibraryEmptyStateProps {
  kind: DashboardLibraryEmptyKind
  /** Full card (library empty) or compact section placeholder. */
  layout?: 'card' | 'section'
  /** When true, "no finished stories" copy references plans in the list below. */
  hasStoryPlans?: boolean
  onCreateStory?: () => void
}

/** Teacher-facing empty states for the Your stories dashboard library. */
export function DashboardLibraryEmptyState({
  kind,
  layout = 'card',
  hasStoryPlans = false,
  onCreateStory,
}: DashboardLibraryEmptyStateProps) {
  if (kind === 'no-stories') {
    return (
      <EmptyState
        layout="card"
        showIcon
        title="No stories yet"
        description="Start a Nina & Nino story for your class. Save your plan, generate pages when you are ready, and find everything here."
        hints={[
          'Create a story plan with your lesson goal, age group, and theme.',
          'Generate your full classroom story when the plan looks good.',
          'Finished stories appear here so you can read, edit, or print them.',
        ]}
        actionLabel="Create your first story"
        onAction={onCreateStory}
      />
    )
  }

  if (kind === 'no-story-plans') {
    const description =
      'Story plans hold your lesson setup before you generate. Create one to start your next Nina & Nino story.'

    if (layout === 'card') {
      return (
        <EmptyState
          layout="card"
          showIcon
          title="No story plans yet"
          description={description}
          hints={[
            'Add your lesson goal, vocabulary, and major story events.',
            'Save the plan anytime — you do not need to generate right away.',
          ]}
          actionLabel="Start a story plan"
          onAction={onCreateStory}
        />
      )
    }

    return (
      <div className="space-y-3">
        <EmptyState
          layout="section"
          title="No story plans yet"
          description={description}
          className="text-left"
        />
        {onCreateStory && (
          <AppButton type="button" variant="ghost" size="sm" onClick={onCreateStory}>
            Start a story plan
          </AppButton>
        )}
      </div>
    )
  }

  const description = hasStoryPlans
    ? 'You have story plans saved below. Open a plan and choose Generate story to create pages for your class.'
    : 'Finished stories appear here after you generate from a story plan. Create a plan first, then generate when you are ready.'

  const actionLabel = hasStoryPlans ? undefined : 'Create a story plan'

  if (layout === 'card') {
    return (
      <EmptyState
        layout="card"
        showIcon
        title="No finished stories yet"
        description={description}
        hints={
          hasStoryPlans
            ? [
                'Finished stories include pages, vocabulary cards, and illustration notes.',
                'After generating, save the story to keep it in Your stories.',
              ]
            : [
                'Story plans and finished stories both appear in Your stories.',
                'You can save a plan now and generate later.',
              ]
        }
        actionLabel={actionLabel}
        onAction={onCreateStory}
      />
    )
  }

  return (
    <div className="space-y-3">
      <EmptyState
        layout="section"
        title="No finished stories yet"
        description={description}
        className="text-left"
      />
      {actionLabel && onCreateStory && (
        <AppButton type="button" variant="ghost" size="sm" onClick={onCreateStory}>
          {actionLabel}
        </AppButton>
      )}
    </div>
  )
}
