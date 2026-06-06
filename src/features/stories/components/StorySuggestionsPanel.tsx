import { AppCard } from '@/shared/components'
import type { TeacherGuidanceSuggestion } from '@/features/story-guidance'

interface StorySuggestionsPanelProps {
  suggestions: TeacherGuidanceSuggestion[]
  title?: string
  className?: string
}

const kindLabels: Record<TeacherGuidanceSuggestion['kind'], string> = {
  vocabulary_recent: 'Vocabulary',
  setting_frequent: 'Setting',
  theme_recent: 'Theme',
  target_words: 'Target words',
  continuity: 'Continuity',
}

export function StorySuggestionsPanel({
  suggestions,
  title = 'Story suggestions',
  className = '',
}: StorySuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <AppCard
      padding="md"
      className={['border-sky-200 bg-sky-50/60', className].filter(Boolean).join(' ')}
      role="note"
      aria-label={title}
    >
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-sky-950">{title}</h3>
          <p className="mt-1 text-xs text-sky-800/80">
            Suggestions only — you decide what to keep or change.
          </p>
        </div>

        <ul className="space-y-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="rounded-lg border border-sky-200/80 bg-white/70 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-sky-800">
                  {kindLabels[suggestion.kind]}
                </span>
                <p className="text-sm text-stone-800">{suggestion.message}</p>
              </div>
              {suggestion.detail && (
                <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{suggestion.detail}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AppCard>
  )
}
