import type { GeneratedStory } from '@/features/stories/types'
import { useStudentStoryReader } from '../hooks'
import { getStudentActivityLabel, STUDENT_ACTIVITIES } from '../types'
import { StudentActivityMenu, StudentActivityView } from './student-activities'
import { StudentStoryNavigation } from './StudentStoryNavigation'
import { StudentStoryPageView } from './StudentStoryPageView'

export interface StudentStoryReaderProps {
  story: GeneratedStory
}

function resolveProgressLabel(
  reader: ReturnType<typeof useStudentStoryReader>,
): string {
  if (reader.currentSlide.kind === 'activities') {
    if (reader.activeActivity) {
      return getStudentActivityLabel(reader.activeActivity)
    }

    return 'Activities'
  }

  return `Page ${reader.currentSlide.index} of ${reader.currentSlide.total}`
}

export function StudentStoryReader({ story }: StudentStoryReaderProps) {
  const reader = useStudentStoryReader(story)
  const progressLabel = resolveProgressLabel(reader)
  const showStoryNavigation = reader.currentSlide.kind === 'page'

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-50 via-white to-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          <h1 className="truncate text-lg font-semibold text-stone-900 sm:text-xl">{story.title}</h1>
          <p className="text-sm font-medium text-brand-700">{progressLabel}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        {reader.currentSlide.kind === 'page' ? (
          <StudentStoryPageView slide={reader.currentSlide} imagePrompts={story.imagePrompts} />
        ) : reader.activeActivity ? (
          <StudentActivityView
            activityId={reader.activeActivity}
            flashcards={story.flashcards}
            onBack={reader.clearActivity}
          />
        ) : (
          <StudentActivityMenu
            activities={STUDENT_ACTIVITIES}
            onSelect={reader.selectActivity}
            onBackToStory={reader.goPrevious}
          />
        )}
      </main>

      {showStoryNavigation ? (
        <footer className="sticky bottom-0 border-t border-stone-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto max-w-3xl">
            <StudentStoryNavigation
              canGoPrevious={reader.canGoPrevious}
              canGoNext={reader.canGoNext}
              onPrevious={reader.goPrevious}
              onNext={reader.goNext}
              nextLabel={reader.nextLabel}
            />
          </div>
        </footer>
      ) : null}
    </div>
  )
}
