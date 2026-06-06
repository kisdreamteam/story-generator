import { memo, useEffect } from 'react'
import { AppButton, AppCard, AppInput, AppTextarea } from '@/shared/components'
import { displayDetailValue } from '@/features/stories/utils/storyDetailView'
import type { EditablePageCardViewModel, EditablePageCommit } from '../types/editablePage.types'
import { useEditablePageCardState } from '../hooks/useEditablePageCardState'

export interface EditableStoryPageCardProps {
  model: EditablePageCardViewModel
  isEditing: boolean
  editBlocked?: boolean
  disabled?: boolean
  includesFlashcards?: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: (commit: EditablePageCommit) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const EditableStoryPageCard = memo(function EditableStoryPageCard({
  model,
  isEditing,
  editBlocked = false,
  disabled = false,
  includesFlashcards = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDirtyChange,
}: EditableStoryPageCardProps) {
  const { page, imagePrompt } = model

  const {
    draft,
    fieldErrors,
    isDirty,
    wordCount,
    updateTeachingFocus,
    updateText,
    updateImagePromptField,
    updateFlashcard,
    cancelEdits,
    buildCommit,
  } = useEditablePageCardState({
    model,
    isEditing,
    includesFlashcards,
  })

  useEffect(() => {
    if (isEditing) {
      onDirtyChange?.(isDirty)
    } else {
      onDirtyChange?.(false)
    }
  }, [isEditing, isDirty, onDirtyChange])

  function handleCancel() {
    cancelEdits()
    onCancelEdit()
  }

  function handleSave() {
    const commit = buildCommit()
    if (!commit) return
    onSave(commit)
  }

  return (
    <AppCard
      padding="md"
      className={[
        'border-stone-200 bg-white transition-colors',
        isEditing ? 'border-amber-300 ring-1 ring-amber-200' : 'hover:border-stone-300',
      ].join(' ')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            Page {page.pageNumber}
          </span>
          {isEditing && isDirty ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
              Unsaved on this page
            </span>
          ) : null}
        </div>
        <span className="text-xs text-stone-500">{wordCount} words</span>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Page title</p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              {displayDetailValue(page.teachingFocus, 'No page title yet')}
            </p>
          </div>

          <p className="whitespace-pre-line text-base leading-[1.75] text-stone-900">{page.text}</p>

          {imagePrompt && (
            <div className="rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Illustration
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">{imagePrompt.prompt}</p>
              {imagePrompt.continuityReminder.trim() ? (
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  <span className="font-medium text-stone-700">Keep consistent:</span>{' '}
                  {imagePrompt.continuityReminder}
                </p>
              ) : null}
            </div>
          )}

          {includesFlashcards && model.flashcards && model.flashcards.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Story vocabulary
              </p>
              <ul className="space-y-2">
                {model.flashcards.map((card) => (
                  <li
                    key={card.word}
                    className="rounded-lg border border-stone-100 bg-stone-50/60 px-3 py-2 text-sm text-stone-800"
                  >
                    <span className="font-semibold text-stone-900">{card.word}</span>
                    {' — '}
                    {card.simpleDefinition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onStartEdit}
              disabled={disabled || editBlocked}
            >
              Edit page
            </AppButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AppInput
            label="Page title"
            value={draft.teachingFocus}
            onChange={(event) => updateTeachingFocus(event.target.value)}
            error={fieldErrors.teachingFocus}
            hint="A short line about what this page teaches."
          />

          <AppTextarea
            label="Page text"
            value={draft.text}
            onChange={(event) => updateText(event.target.value)}
            error={fieldErrors.text}
            className="min-h-[140px]"
          />

          <div className="space-y-3 rounded-lg border border-stone-100 bg-stone-50/50 p-3">
            <p className="text-sm font-medium text-stone-800">Illustration notes</p>
            <AppTextarea
              label="Illustration prompt"
              value={draft.imagePrompt?.prompt ?? ''}
              onChange={(event) => updateImagePromptField('prompt', event.target.value)}
              error={fieldErrors.imagePrompt}
              className="min-h-[80px]"
            />
            <AppTextarea
              label="Keep characters consistent"
              value={draft.imagePrompt?.continuityReminder ?? ''}
              onChange={(event) => updateImagePromptField('continuityReminder', event.target.value)}
              error={fieldErrors.continuityReminder}
              className="min-h-[64px]"
            />
          </div>

          {includesFlashcards && draft.flashcards.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-800">Story vocabulary</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {draft.flashcards.map((card, index) => (
                  <AppCard key={`${card.word}-${index}`} padding="sm" className="border-stone-200">
                    <AppInput
                      label="Word"
                      value={card.word}
                      onChange={(event) => updateFlashcard(index, 'word', event.target.value)}
                      error={fieldErrors[`flashcard-${index}-word`]}
                    />
                    <div className="mt-3">
                      <AppTextarea
                        label="Definition"
                        value={card.simpleDefinition}
                        onChange={(event) =>
                          updateFlashcard(index, 'simpleDefinition', event.target.value)
                        }
                        error={fieldErrors[`flashcard-${index}-definition`]}
                        className="min-h-[72px]"
                      />
                    </div>
                    <div className="mt-3">
                      <AppTextarea
                        label="Example sentence"
                        value={card.exampleSentence}
                        onChange={(event) =>
                          updateFlashcard(index, 'exampleSentence', event.target.value)
                        }
                        className="min-h-[64px]"
                      />
                    </div>
                  </AppCard>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end">
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleCancel}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              fullWidth
              className="sm:w-auto"
            >
              Save page
            </AppButton>
          </div>
        </div>
      )}
    </AppCard>
  )
})
