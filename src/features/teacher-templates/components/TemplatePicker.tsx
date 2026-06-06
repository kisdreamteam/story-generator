import { AppCard } from '@/shared/components'
import { getTeacherTemplateCategoryLabel } from '../lib/teacherTemplateUtils'
import type { TeacherTemplateSummary } from '../types/teacherTemplate.types'

export interface TemplatePickerProps {
  templates: TeacherTemplateSummary[]
  selectedTemplateId?: string | null
  onSelect: (templateId: string) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

function categoryBadgeClasses(category: TeacherTemplateSummary['category']): string {
  switch (category) {
    case 'field-trip':
      return 'bg-sky-50 text-sky-800 ring-sky-200'
    case 'phonics':
      return 'bg-violet-50 text-violet-800 ring-violet-200'
    case 'roleplay':
      return 'bg-amber-50 text-amber-800 ring-amber-200'
    case 'sel':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    default:
      return 'bg-stone-100 text-stone-700 ring-stone-200'
  }
}

export function TemplatePicker({
  templates,
  selectedTemplateId,
  onSelect,
  isLoading = false,
  disabled = false,
  className = '',
}: TemplatePickerProps) {
  if (isLoading) {
    return (
      <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
        <p className="text-sm text-stone-600">Loading templates…</p>
      </AppCard>
    )
  }

  return (
    <AppCard padding="md" className={`border-stone-200 bg-stone-50/40 ${className}`.trim()}>
      <div className="mb-4 space-y-1">
        <h2 className="text-sm font-semibold text-stone-900">Start from a template</h2>
        <p className="text-xs leading-relaxed text-stone-600">
          Templates fill setup fields, preferences, and vocabulary targets. You can edit everything
          before you generate a story.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id

          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onSelect(template.id)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={[
                  'flex h-full w-full flex-col rounded-xl border px-3 py-3 text-left transition',
                  isSelected
                    ? 'border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80',
                  disabled ? 'cursor-not-allowed opacity-60' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${categoryBadgeClasses(template.category)}`}
                  >
                    {getTeacherTemplateCategoryLabel(template.category)}
                  </span>
                  {template.isBuiltIn ? (
                    <span className="text-[11px] text-stone-500">Built-in</span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-stone-900">{template.name}</p>
                {template.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{template.description}</p>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      {templates.length === 0 ? (
        <p className="text-sm text-stone-600">No templates yet. Save your current setup as one below.</p>
      ) : null}
    </AppCard>
  )
}
