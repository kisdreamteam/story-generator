import { AppButton, AppCard, ComingSoonBadge, SectionCard } from '../../../shared/components'
import type { GeneratedStoryPage } from '../types'

interface TeacherNotesPanelProps {
  learningGoal: string
  vocabularyFocus: string
  pages: GeneratedStoryPage[]
}

export function TeacherNotesPanel({
  learningGoal,
  vocabularyFocus,
  pages,
}: TeacherNotesPanelProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Learning Goals"
        description="Review targets from story setup for classroom planning"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Learning goal
            </p>
            <p className="mt-1 text-sm text-stone-800">{learningGoal}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Vocabulary focus
            </p>
            <p className="mt-1 text-sm text-stone-800">{vocabularyFocus}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Teaching Focus by Page"
        description="What each page is designed to teach"
      >
        <div className="space-y-3">
          {pages.map((page) => (
            <AppCard key={page.pageNumber} padding="sm" className="border-stone-100 bg-stone-50">
              <p className="text-xs font-medium text-stone-500">Page {page.pageNumber}</p>
              <p className="mt-1 text-sm text-stone-800">{page.teachingFocus}</p>
            </AppCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Suggested Classroom Activity"
        description="Optional extension for after reading"
      >
        <AppCard padding="sm" className="border-dashed border-stone-200 bg-stone-50">
          <p className="text-sm text-stone-600">
            Placeholder: guided vocabulary practice, role-play, or drawing activity tied to this
            story.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AppButton variant="secondary" size="sm" disabled>
              Generate Activity
            </AppButton>
            <ComingSoonBadge />
          </div>
        </AppCard>
      </SectionCard>
    </div>
  )
}
