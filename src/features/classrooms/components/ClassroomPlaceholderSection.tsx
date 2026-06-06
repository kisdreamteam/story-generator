import { ComingSoonBadge, SectionCard } from '@/shared/components'

export function ClassroomStoriesPlaceholder() {
  return (
    <SectionCard
      title="Shared stories"
      description="Stories you share with this classroom will appear here."
    >
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center">
        <ComingSoonBadge />
        <p className="mt-4 text-sm text-stone-600">
          Story sharing for classrooms is coming soon. For now, create stories and read them aloud
          with your class from Your stories.
        </p>
      </div>
    </SectionCard>
  )
}

export function ClassroomStudentsPlaceholder() {
  return (
    <SectionCard
      title="Students"
      description="Student accounts and rosters are not available yet."
    >
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center">
        <ComingSoonBadge />
        <p className="mt-4 text-sm text-stone-600">
          This app is teacher-first for now. You will be able to organize learners here in a later
          release — no student sign-in required today.
        </p>
      </div>
    </SectionCard>
  )
}
