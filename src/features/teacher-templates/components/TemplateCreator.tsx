import { useState } from 'react'
import type { FormEvent } from 'react'
import { AppButton, AppCard, AppInput, AppSelect, AppTextarea } from '@/shared/components'
import type { StorySetupFormValues } from '@/features/stories/utils/storySetupForm'
import type { TeacherTemplateCategory } from '../types/teacherTemplate.types'

const categoryOptions = [
  { value: 'custom', label: 'Custom' },
  { value: 'field-trip', label: 'Field trip' },
  { value: 'phonics', label: 'Phonics' },
  { value: 'roleplay', label: 'Roleplay' },
  { value: 'sel', label: 'SEL' },
]

export interface TemplateCreatorProps {
  formValues: StorySetupFormValues
  isSaving?: boolean
  error?: string | null
  onSave: (input: {
    name: string
    description: string
    category: TeacherTemplateCategory
    formValues: StorySetupFormValues
  }) => void | Promise<void>
  className?: string
}

export function TemplateCreator({
  formValues,
  isSaving = false,
  error,
  onSave,
  className = '',
}: TemplateCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TeacherTemplateCategory>('custom')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || isSaving) return

    await onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      formValues,
    })

    setName('')
    setDescription('')
    setCategory('custom')
    setIsOpen(false)
  }

  return (
    <AppCard padding="md" className={`border-stone-200 bg-white ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-stone-900">Save as template</h2>
          <p className="text-xs leading-relaxed text-stone-600">
            Store your current setup, preferences, and vocabulary targets for reuse on future stories.
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen((open) => !open)}
          className="self-start"
        >
          {isOpen ? 'Close' : 'Create template'}
        </AppButton>
      </div>

      {isOpen ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-stone-100 pt-4">
          <AppInput
            label="Template name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            hint="Example: Zoo field trip prep"
            required
          />
          <AppTextarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            hint="Optional — helps you pick the right template later."
          />
          <AppSelect
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value as TeacherTemplateCategory)}
            options={categoryOptions}
          />

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex justify-end">
            <AppButton type="submit" disabled={!name.trim() || isSaving}>
              {isSaving ? 'Saving template…' : 'Save template'}
            </AppButton>
          </div>
        </form>
      ) : null}
    </AppCard>
  )
}
