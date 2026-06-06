import { Outlet } from 'react-router-dom'
import { FeatureRouteBoundary } from '@/shared/components/errors'

/** Full-screen student story shell — no dashboard or marketing chrome. */
export function StudentStoryLayout() {
  return (
    <FeatureRouteBoundary
      featureName="student-story"
      title="Could not open this story"
      description="Something went wrong while loading the story. Ask your teacher to share the link again."
    >
      <Outlet />
    </FeatureRouteBoundary>
  )
}
