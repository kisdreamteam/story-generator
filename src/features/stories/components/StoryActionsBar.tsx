import { AppButton, ComingSoonBadge } from '@/shared/components'

export type StoryActionKey =
  | 'edit'
  | 'save'
  | 'saveAsCopy'
  | 'cancel'
  | 'complete'
  | 'duplicate'
  | 'delete'
  | 'assignClassroom'
  | 'ai'

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface StoryActionConfig {
  key: StoryActionKey
  label?: string
  hidden?: boolean
  disabled?: boolean
  loading?: boolean
  variant?: AppButtonVariant
  onClick?: () => void
  /** Shows a "Coming soon" badge beside the label */
  comingSoon?: boolean
}

export interface StoryActionsBarProps {
  actions: StoryActionConfig[]
  className?: string
}

const DEFAULT_LABELS: Record<StoryActionKey, string> = {
  edit: 'Edit pages',
  save: 'Save changes',
  saveAsCopy: 'Save as copy',
  cancel: 'Cancel',
  complete: 'Mark lesson done',
  duplicate: 'Duplicate',
  delete: 'Delete story',
  assignClassroom: 'Assign to classroom',
  ai: 'Story ideas',
}

const DEFAULT_VARIANTS: Record<StoryActionKey, AppButtonVariant> = {
  edit: 'secondary',
  save: 'primary',
  saveAsCopy: 'secondary',
  cancel: 'ghost',
  complete: 'secondary',
  duplicate: 'secondary',
  delete: 'danger',
  assignClassroom: 'secondary',
  ai: 'secondary',
}

const LOADING_LABELS: Partial<Record<StoryActionKey, string>> = {
  save: 'Saving…',
  saveAsCopy: 'Saving copy…',
  complete: 'Marking…',
  duplicate: 'Duplicating…',
  delete: 'Deleting…',
}

const MANAGEMENT_ACTIONS: StoryActionKey[] = [
  'complete',
  'duplicate',
  'assignClassroom',
  'delete',
  'ai',
]
const WORKFLOW_ACTIONS: StoryActionKey[] = ['edit', 'cancel', 'saveAsCopy', 'save']

const WORKFLOW_ORDER: Record<StoryActionKey, number> = {
  edit: 0,
  cancel: 1,
  saveAsCopy: 2,
  save: 3,
  complete: 4,
  duplicate: 5,
  delete: 6,
  assignClassroom: 7,
  ai: 8,
}

function isComingSoonAction(action: StoryActionConfig): boolean {
  if (action.comingSoon !== undefined) return action.comingSoon
  return action.key === 'ai' && !action.onClick
}

function renderActionButton(action: StoryActionConfig) {
  const label = action.label ?? DEFAULT_LABELS[action.key]
  const displayLabel =
    action.loading && LOADING_LABELS[action.key] ? LOADING_LABELS[action.key] : label
  const variant = action.variant ?? DEFAULT_VARIANTS[action.key]
  const comingSoon = isComingSoonAction(action)
  const isDisabled = action.disabled || action.loading || (comingSoon && !action.onClick)

  return (
    <AppButton
      key={action.key}
      type="button"
      variant={variant}
      onClick={action.onClick}
      disabled={isDisabled}
      fullWidth
      className="sm:w-auto"
    >
      <span>{displayLabel}</span>
      {comingSoon ? <ComingSoonBadge /> : null}
    </AppButton>
  )
}

export function StoryActionsBar({ actions, className = '' }: StoryActionsBarProps) {
  const visible = actions.filter((action) => !action.hidden)
  if (visible.length === 0) return null

  const management = visible.filter((action) => MANAGEMENT_ACTIONS.includes(action.key))
  const workflow = visible
    .filter((action) => WORKFLOW_ACTIONS.includes(action.key))
    .sort((a, b) => WORKFLOW_ORDER[a.key] - WORKFLOW_ORDER[b.key])

  const hasBothGroups = management.length > 0 && workflow.length > 0

  return (
    <div
      className={[
        'rounded-xl border border-stone-200 bg-white p-3 shadow-sm sm:p-4',
        'flex flex-col gap-3',
        hasBothGroups ? 'sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between' : '',
        !hasBothGroups && workflow.length > 0 ? 'sm:flex-row sm:justify-end' : '',
        !hasBothGroups && management.length > 0 ? 'sm:flex-row sm:flex-wrap' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      aria-label="Story actions"
    >
      {management.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {management.map(renderActionButton)}
        </div>
      ) : null}
      {workflow.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {workflow.map(renderActionButton)}
        </div>
      ) : null}
    </div>
  )
}
