import type { EmptyStateProps } from '../EmptyState'

export type AppEmptyStateKind =
  | 'story-library-empty'
  | 'story-library-no-plans'
  | 'story-library-no-finished'
  | 'story-library-no-results'
  | 'story-not-found'
  | 'story-not-generated'
  | 'classroom-library-empty'
  | 'classroom-not-found'
  | 'classroom-story-library-empty'
  | 'story-classroom-assignments-empty'

export interface AppEmptyStatePresetOptions {
  hasStoryPlans?: boolean
}

export interface AppEmptyStatePreset {
  title: string
  description: string
  hints?: string[]
  actionLabel?: string
  layout?: EmptyStateProps['layout']
  showIcon?: boolean
}

export function getAppEmptyStatePreset(
  kind: AppEmptyStateKind,
  options: AppEmptyStatePresetOptions = {},
): AppEmptyStatePreset {
  switch (kind) {
    case 'story-library-empty':
      return {
        layout: 'card',
        showIcon: true,
        title: 'No stories yet',
        description:
          'Start a Nina & Nino story for your class. Save your plan, generate pages when you are ready, and find everything here.',
        hints: [
          'Create a story plan with your lesson goal, age group, and theme.',
          'Generate your full classroom story when the plan looks good.',
          'Finished stories appear here so you can read, edit, or print them.',
        ],
        actionLabel: 'Create your first story',
      }

    case 'story-library-no-plans':
      return {
        layout: options.hasStoryPlans ? 'section' : 'card',
        showIcon: !options.hasStoryPlans,
        title: 'No story plans yet',
        description:
          'Story plans hold your lesson setup before you generate. Create one to start your next Nina & Nino story.',
        hints: options.hasStoryPlans
          ? undefined
          : [
              'Add your lesson goal, vocabulary, and major story events.',
              'Save the plan anytime — you do not need to generate right away.',
            ],
        actionLabel: options.hasStoryPlans ? undefined : 'Start a story plan',
      }

    case 'story-library-no-finished': {
      const hasStoryPlans = options.hasStoryPlans ?? false
      return {
        layout: hasStoryPlans ? 'section' : 'card',
        showIcon: !hasStoryPlans,
        title: 'No finished stories yet',
        description: hasStoryPlans
          ? 'You have story plans saved below. Open a plan and choose Generate story to create pages for your class.'
          : 'Finished stories appear here after you generate from a story plan. Create a plan first, then generate when you are ready.',
        hints: hasStoryPlans
          ? [
              'Finished stories include pages, vocabulary cards, and illustration notes.',
              'After generating, save the story to keep it in Your stories.',
            ]
          : [
              'Story plans and finished stories both appear in Your stories.',
              'You can save a plan now and generate later.',
            ],
        actionLabel: hasStoryPlans ? undefined : 'Create a story plan',
      }
    }

    case 'story-library-no-results':
      return {
        layout: 'section',
        title: 'No stories match your search',
        description: 'Try different search words or clear filters to see your full library.',
      }

    case 'story-not-found':
      return {
        layout: 'card',
        showIcon: true,
        title: 'Story not found',
        description:
          'We could not find this story. It may have been deleted or saved to your account instead.',
        actionLabel: 'Back to stories',
      }

    case 'story-not-generated':
      return {
        layout: 'card',
        showIcon: true,
        title: 'This story is not ready to edit',
        description: 'Generate your classroom story first, then you can edit pages here.',
        actionLabel: 'Back to story',
      }

    case 'classroom-library-empty':
      return {
        layout: 'card',
        showIcon: true,
        title: 'No classrooms yet',
        description:
          'Classroom setup is coming soon. For now, create Nina & Nino stories and read them with your class from Your stories.',
        hints: [
          'Classrooms will help you organize shared story links for each class.',
          'Student accounts are not required — this stays teacher-first.',
          'Create a story today and return here when classroom sharing launches.',
        ],
        actionLabel: 'Browse your stories',
      }

    case 'classroom-story-library-empty':
      return {
        layout: 'section',
        title: 'No stories assigned yet',
        description:
          'Assign stories from Your stories to build this classroom library.',
        actionLabel: 'Browse your stories',
      }

    case 'story-classroom-assignments-empty':
      return {
        layout: 'section',
        title: 'Not assigned to a classroom',
        description: 'Use Assign to classroom above to link this story to one or more classes.',
      }

    case 'classroom-not-found':
      return {
        layout: 'card',
        showIcon: true,
        title: 'Classroom not found',
        description:
          'We could not find this classroom. It may have been removed or is not available yet.',
        actionLabel: 'Back to classrooms',
      }

    default:
      return {
        title: 'Nothing here yet',
        description: 'Check back after you add content.',
      }
  }
}
