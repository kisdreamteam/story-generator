import { useParams } from 'react-router-dom'
import { StudentStoryLoadGuard, StudentStoryReader } from '../components'
import { useStudentStoryRoute } from '../hooks'

/** Public student story route — read-only, no login, no dashboard chrome. */
export function StudentStoryPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const { status, story, presentation, reload } = useStudentStoryRoute(storyId)

  return (
    <StudentStoryLoadGuard status={status} presentation={presentation} onRetry={reload}>
      {story ? <StudentStoryReader story={story} /> : null}
    </StudentStoryLoadGuard>
  )
}
