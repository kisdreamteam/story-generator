import { AppButton, ComingSoonBadge } from '../../../shared/components'

export function NeedIdeasButton() {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <AppButton type="button" variant="ghost" size="sm" disabled>
        Need ideas?
      </AppButton>
      <ComingSoonBadge />
    </div>
  )
}
