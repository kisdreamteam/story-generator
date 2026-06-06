import type { StoryEditorViewMode } from '../hooks/useStoryEditorViewMode'

export interface StoryEditorModeToggleProps {
  mode: StoryEditorViewMode
  onModeChange: (mode: StoryEditorViewMode) => void
  disabled?: boolean
  className?: string
}

const modes: { value: StoryEditorViewMode; label: string }[] = [
  { value: 'edit', label: 'Edit mode' },
  { value: 'preview', label: 'Preview mode' },
]

export function StoryEditorModeToggle({
  mode,
  onModeChange,
  disabled = false,
  className = '',
}: StoryEditorModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Story view mode"
      className={[
        'inline-flex w-full rounded-lg border border-stone-200 bg-stone-50 p-1 sm:w-auto',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {modes.map(({ value, label }) => {
        const isActive = mode === value

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onModeChange(value)}
            className={[
              'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:flex-none sm:text-sm',
              isActive
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                : 'text-stone-600 hover:text-stone-900',
              disabled ? 'cursor-not-allowed opacity-50' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
