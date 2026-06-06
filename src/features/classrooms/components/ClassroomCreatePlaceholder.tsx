import { ComingSoonBadge, SectionCard } from '@/shared/components'

export function ClassroomCreatePlaceholder() {
  return (
    <SectionCard
      title="Create a classroom"
      description="Organize stories and sharing settings for one class group."
    >
      <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-6">
        <ComingSoonBadge />
        <p className="text-sm leading-relaxed text-stone-600">
          Classroom setup is coming soon. You will be able to name a class, note the grade level,
          and prepare shared story links — without student accounts.
        </p>
      </div>
    </SectionCard>
  )
}
