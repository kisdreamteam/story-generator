import { AppButton, ComingSoonBadge } from '@/shared/components'
import { panelShellClass } from '@/shared/styles/surfaceClasses'

export type StoryActionKey =
  | 'edit'
  | 'advancedEditor'
  | 'save'
  | 'saveAsCopy'
  | 'cancel'
  | 'complete'
  | 'duplicate'
  | 'archive'
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
  edit: 'Quick edit',
  advancedEditor: 'Advanced editor',
  save: 'Save changes',
  saveAsCopy: 'Save as copy',
  cancel: 'Cancel',
  complete: 'Mark lesson done',
  duplicate: 'Duplicate',
  archive: 'Archive story',
  delete: 'Delete story',
  assignClassroom: 'Assign to classroom',
  ai: 'Story ideas',
}

const DEFAULT_VARIANTS: Record<StoryActionKey, AppButtonVariant> = {
  edit: 'secondary',
  advancedEditor: 'ghost',
  save: 'primary',
  saveAsCopy: 'secondary',
  cancel: 'ghost',
  complete: 'secondary',
  duplicate: 'secondary',
  archive: 'ghost',
  delete: 'danger',
  assignClassroom: 'secondary',
  ai: 'secondary',
}

const LOADING_LABELS: Partial<Record<StoryActionKey, string>> = {
  save: 'Saving…',
  saveAsCopy: 'Saving copy…',
  complete: 'Marking…',
  duplicate: 'Duplicating…',
  archive: 'Archiving…',
  delete: 'Deleting…',
}

const MANAGEMENT_ACTIONS: StoryActionKey[] = [
  'complete',
  'duplicate',
  'archive',
  'assignClassroom',
  'delete',
  'ai',
]
const WORKFLOW_ACTIONS: StoryActionKey[] = ['edit', 'advancedEditor', 'cancel', 'saveAsCopy', 'save']

const WORKFLOW_ORDER: Record<StoryActionKey, number> = {
  edit: 0,
  advancedEditor: 1,
  cancel: 2,
  saveAsCopy: 3,
  save: 4,
  complete: 5,
  duplicate: 6,
  archive: 7,
  delete: 8,
  assignClassroom: 9,
  ai: 10,
}

function isComingSoonAction(action: StoryActionConfig): boolean {
  if (action.comingSoon !== undefined) return action.comingSoon
  return action.key === 'ai' && !action.onClick
}

function renderActionButton(action: StoryActionConfig, options?: { emphasizePrimary?: boolean }) {
  const label = action.label ?? DEFAULT_LABELS[action.key]
  const loadingLabel =
    action.loading && action.label === 'Unarchive story'
      ? 'Restoring…'
      : action.loading && LOADING_LABELS[action.key]
        ? LOADING_LABELS[action.key]
        : null
  const displayLabel = loadingLabel ?? label
  let variant = action.variant ?? DEFAULT_VARIANTS[action.key]
  if (options?.emphasizePrimary && action.key === 'edit' && !action.variant) {
    variant = 'primary'
  }
  const comingSoon = isComingSoonAction(action)
  const isDisabled = action.disabled || action.loading || (comingSoon && !action.onClick)
  const orderClass =
    action.key === 'save'
      ? 'order-1 sm:order-last'
      : action.key === 'cancel' || action.key === 'saveAsCopy'
        ? 'order-2 sm:order-none'
        : ''

  return (
    <AppButton
      key={action.key}
      type="button"
      variant={variant}
      size={action.key === 'delete' ? 'md' : action.key === 'edit' || action.key === 'save' ? 'md' : 'sm'}
      onClick={action.onClick}
      disabled={isDisabled}
      fullWidth
      className={[orderClass, 'sm:w-auto'].filter(Boolean).join(' ')}
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
  const isEditingMode = workflow.some((action) => action.key === 'save')
  const isReadWorkflow = workflow.some((action) => action.key === 'edit') && !isEditingMode

  return (
    <div
      className={[
        panelShellClass,
        'flex flex-col gap-3 p-3 shadow-sm sm:p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      aria-label="Story actions"
    >
      {management.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {management.map((action) => renderActionButton(action))}
        </div>
      ) : null}
      {workflow.length > 0 ? (
        <div
          className={[
            'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end',
            hasBothGroups ? 'border-t border-stone-100 pt-3' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {workflow.map((action) =>
            renderActionButton(action, { emphasizePrimary: isReadWorkflow }),
          )}
        </div>
      ) : null}
    </div>
  )
}
