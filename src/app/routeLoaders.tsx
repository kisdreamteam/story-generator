import { FeatureRouteBoundary } from '@/shared/components/errors'

/** Shared error-boundary copy for create / generation routes. */
export const storyGenerationBoundaryProps = {
  featureName: 'story-generation',
  title: 'Could not load story creator',
  description:
    'Something broke while opening the story creation flow. Your saved plans and stories are still in Your stories.',
} as const

/** Shared error-boundary copy for story detail routes. */
export const storyDetailBoundaryProps = {
  featureName: 'story-detail',
  title: 'Could not load this story',
  description:
    'Something broke while opening this story. You can try again or go back to Your stories.',
} as const

/** Shared error-boundary copy for classroom detail routes. */
export const classroomDetailBoundaryProps = {
  featureName: 'classroom-detail',
  title: 'Could not load this classroom',
  description:
    'Something broke while opening this classroom. You can try again or go back to Your classrooms.',
} as const

/** Shared error-boundary copy for the public student story route. */
export const studentStoryBoundaryProps = {
  featureName: 'student-story',
  title: 'Could not open this story',
  description: 'Something went wrong while loading the story. Ask your teacher to share the link again.',
} as const

/**
 * Route-level code splitting via react-router `lazy`.
 * Heavy pages (create flow, library, detail, legacy project wizard) load on demand
 * so the landing/dashboard shell stays in the initial bundle.
 */
export async function loadCreateStoryRoute() {
  const { CreateStoryPage } = await import('./pages/CreateStoryPage')

  return {
    Component: function CreateStoryRoute() {
      return (
        <FeatureRouteBoundary {...storyGenerationBoundaryProps}>
          <CreateStoryPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoriesRoute() {
  const { StoriesPage } = await import('./pages/StoriesPage')
  return { Component: StoriesPage }
}

export async function loadStoryDetailRoute() {
  const { StoryDetailPage } = await import('@/features/stories/pages/StoryDetailPage')

  return {
    Component: function StoryDetailRoute() {
      return (
        <FeatureRouteBoundary {...storyDetailBoundaryProps}>
          <StoryDetailPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoryEditRoute() {
  const { StoryEditPage } = await import('./pages/StoryEditPage')

  return {
    Component: function StoryEditRoute() {
      return (
        <FeatureRouteBoundary {...storyDetailBoundaryProps}>
          <StoryEditPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoryReaderRoute() {
  const { StoryReaderPage } = await import('@/features/story-reader/pages/StoryReaderPage')

  return {
    Component: function StoryReaderRoute() {
      return (
        <FeatureRouteBoundary {...storyDetailBoundaryProps}>
          <StoryReaderPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoryRoleplayRoute() {
  const { StoryRoleplayPage } = await import('@/features/story-roleplay/pages/StoryRoleplayPage')

  return {
    Component: function StoryRoleplayRoute() {
      return (
        <FeatureRouteBoundary {...storyDetailBoundaryProps}>
          <StoryRoleplayPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoryPrintRoute() {
  const { StoryPrintPage } = await import('@/features/story-export/pages/StoryPrintPage')

  return {
    Component: function StoryPrintRoute() {
      return (
        <FeatureRouteBoundary {...storyDetailBoundaryProps}>
          <StoryPrintPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadSettingsRoute() {
  const { SettingsPage } = await import('./pages/SettingsPage')
  return { Component: SettingsPage }
}

export async function loadClassroomsRoute() {
  const { ClassroomsPage } = await import('@/features/classrooms/pages/ClassroomsPage')
  return { Component: ClassroomsPage }
}

export async function loadClassroomDetailRoute() {
  const { ClassroomDetailPage } = await import('@/features/classrooms/pages/ClassroomDetailPage')

  return {
    Component: function ClassroomDetailRoute() {
      return (
        <FeatureRouteBoundary {...classroomDetailBoundaryProps}>
          <ClassroomDetailPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadCreateProjectRoute() {
  const { CreateProjectPage } = await import('../features/story-projects/pages/CreateProjectPage')
  return { Component: CreateProjectPage }
}

export async function loadStorySetupRoute() {
  const { StorySetupPage } = await import('../features/story-projects/pages/StorySetupPage')

  return {
    Component: function StorySetupRoute() {
      return (
        <FeatureRouteBoundary {...storyGenerationBoundaryProps}>
          <StorySetupPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStoryOutputRoute() {
  const { StoryOutputPage } = await import('../features/story-generation/pages/StoryOutputPage')

  return {
    Component: function StoryOutputRoute() {
      return (
        <FeatureRouteBoundary {...storyGenerationBoundaryProps}>
          <StoryOutputPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadStudentStoryRoute() {
  const { StudentStoryPage } = await import('@/features/student-story/pages/StudentStoryPage')

  return {
    Component: function StudentStoryRoute() {
      return (
        <FeatureRouteBoundary {...studentStoryBoundaryProps}>
          <StudentStoryPage />
        </FeatureRouteBoundary>
      )
    },
  }
}

export async function loadQaChecklistRoute() {
  const { QaChecklistPage } = await import('@/features/dev-qa/pages/QaChecklistPage')

  return {
    Component: function QaChecklistRoute() {
      return <QaChecklistPage />
    },
  }
}
