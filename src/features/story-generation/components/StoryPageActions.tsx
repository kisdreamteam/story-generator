import { AppButton, ComingSoonBadge } from '../../../shared/components'

export function StoryPageActions() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
      <AppButton variant="ghost" size="sm" disabled>
        Edit Text
      </AppButton>
      <AppButton variant="ghost" size="sm" disabled>
        Regenerate Page
      </AppButton>
      <AppButton variant="ghost" size="sm" disabled>
        Lock Page
      </AppButton>
      <ComingSoonBadge />
    </div>
  )
}
