import { AppButton, AppCard } from '../../../shared/components'

interface StoryEmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function StoryEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: StoryEmptyStateProps) {
  const showAction = Boolean(actionLabel && onAction)

  return (
    <AppCard
      padding="lg"
      className="border-dashed border-stone-300 bg-stone-50/50 text-center"
    >
      <div className="mx-auto max-w-md space-y-3">
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
        <p className="text-sm leading-relaxed text-stone-600">{description}</p>
        {showAction && (
          <div className="pt-2">
            <AppButton type="button" onClick={onAction}>
              {actionLabel}
            </AppButton>
          </div>
        )}
      </div>
    </AppCard>
  )
}
