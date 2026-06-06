import { AppButton, AppCard } from '@/shared/components'
import type { TeacherTemplateSummary } from '../types/teacherTemplate.types'
import { TemplateCreator } from './TemplateCreator'
import { TemplatePicker } from './TemplatePicker'
import type { TemplateCreatorProps } from './TemplateCreator'
import type { TemplatePickerProps } from './TemplatePicker'

export interface TeacherTemplatePanelProps
  extends Omit<TemplatePickerProps, 'onSelect'>,
    Pick<TemplateCreatorProps, 'formValues' | 'isSaving' | 'error' | 'onSave'> {
  onApplyTemplate: (templateId: string) => void
  onDeleteTemplate?: (templateId: string) => void
  customTemplates?: TeacherTemplateSummary[]
  className?: string
}

export function TeacherTemplatePanel({
  templates,
  selectedTemplateId,
  onApplyTemplate,
  onDeleteTemplate,
  customTemplates,
  formValues,
  isSaving,
  error,
  onSave,
  isLoading,
  disabled,
  className = '',
}: TeacherTemplatePanelProps) {
  const custom = customTemplates ?? templates.filter((template) => !template.isBuiltIn)

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <TemplatePicker
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelect={onApplyTemplate}
        isLoading={isLoading}
        disabled={disabled}
      />

      {custom.length > 0 && onDeleteTemplate ? (
        <AppCard padding="md" className="border-stone-200 bg-white">
          <h3 className="mb-3 text-sm font-semibold text-stone-900">Your saved templates</h3>
          <ul className="space-y-2">
            {custom.map((template) => (
              <li
                key={template.id}
                className="flex flex-col gap-2 rounded-lg border border-stone-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">{template.name}</p>
                  <p className="text-xs text-stone-500">Updated {template.formattedUpdatedAt}</p>
                </div>
                <div className="flex gap-2 self-start">
                  <AppButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onApplyTemplate(template.id)}
                    disabled={disabled}
                  >
                    Use
                  </AppButton>
                  <AppButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTemplate(template.id)}
                    disabled={disabled}
                  >
                    Delete
                  </AppButton>
                </div>
              </li>
            ))}
          </ul>
        </AppCard>
      ) : null}

      <TemplateCreator
        formValues={formValues}
        isSaving={isSaving}
        error={error}
        onSave={onSave}
      />
    </div>
  )
}
