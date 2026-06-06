import type { RoleplayReaderView } from '../hooks/useRoleplayReader'

interface RoleplayReaderViewToggleProps {
  view: RoleplayReaderView
  onViewChange: (view: RoleplayReaderView) => void
}

export function RoleplayReaderViewToggle({ view, onViewChange }: RoleplayReaderViewToggleProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-50 p-1 sm:inline-grid sm:w-auto"
      role="tablist"
      aria-label="Roleplay view"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === 'step'}
        className={[
          'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
          view === 'step'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        ].join(' ')}
        onClick={() => onViewChange('step')}
      >
        Line by line
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'full'}
        className={[
          'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
          view === 'full'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        ].join(' ')}
        onClick={() => onViewChange('full')}
      >
        Full script
      </button>
    </div>
  )
}
