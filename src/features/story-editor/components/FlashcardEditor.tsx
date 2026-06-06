import { AppButton, AppCard, AppInput, AppTextarea } from '@/shared/components'
import type { StoryFlashcard } from '@/features/stories/types'

export interface FlashcardEditorProps {
  flashcards: StoryFlashcard[]
  disabled?: boolean
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
  onAddFlashcard: (afterIndex?: number) => void
  onRemoveFlashcard: (index: number) => void
  onMoveFlashcard: (index: number, direction: 'up' | 'down') => void
  className?: string
}

export function FlashcardEditor({
  flashcards,
  disabled = false,
  onFlashcardChange,
  onAddFlashcard,
  onRemoveFlashcard,
  onMoveFlashcard,
  className = '',
}: FlashcardEditorProps) {
  const handleRemoveFlashcard = (index: number) => {
    if (
      !window.confirm(
        `Remove flashcard ${index + 1}? This cannot be undone until you reset changes.`,
      )
    ) {
      return
    }

    onRemoveFlashcard(index)
  }

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Vocabulary cards</h3>
          <p className="mt-1 text-xs text-stone-500">
            Edit words and definitions students can review with the story.
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddFlashcard(flashcards.length > 0 ? flashcards.length - 1 : undefined)}
          disabled={disabled}
          className="sm:w-auto"
          fullWidth
        >
          Add flashcard
        </AppButton>
      </div>

      {flashcards.length === 0 ? (
        <AppCard padding="md" className="border-dashed border-stone-200 bg-stone-50/60">
          <p className="text-sm text-stone-600">No vocabulary cards yet.</p>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onAddFlashcard()}
            disabled={disabled}
            className="mt-3"
          >
            Add your first flashcard
          </AppButton>
        </AppCard>
      ) : (
        <ul className="space-y-3">
          {flashcards.map((card, index) => {
            const canMoveUp = index > 0
            const canMoveDown = index < flashcards.length - 1

            return (
              <li key={index}>
                <AppCard padding="md" className="space-y-4 border-stone-200 bg-white">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      Card {index + 1}{' '}
                      <span className="font-normal normal-case text-stone-400">
                        of {flashcards.length}
                      </span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <AppButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onMoveFlashcard(index, 'up')}
                        disabled={disabled || !canMoveUp}
                        fullWidth
                        className="sm:w-auto"
                      >
                        Move up
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onMoveFlashcard(index, 'down')}
                        disabled={disabled || !canMoveDown}
                        fullWidth
                        className="sm:w-auto"
                      >
                        Move down
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onAddFlashcard(index)}
                        disabled={disabled}
                        fullWidth
                        className="sm:w-auto"
                      >
                        Add below
                      </AppButton>
                      <AppButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFlashcard(index)}
                        disabled={disabled}
                        fullWidth
                        className="sm:w-auto"
                      >
                        Remove
                      </AppButton>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AppInput
                      label="Word"
                      value={card.word}
                      onChange={(event) => onFlashcardChange(index, { word: event.target.value })}
                      disabled={disabled}
                    />
                    <AppTextarea
                      label="Simple definition"
                      value={card.simpleDefinition}
                      onChange={(event) =>
                        onFlashcardChange(index, { simpleDefinition: event.target.value })
                      }
                      disabled={disabled}
                      rows={2}
                    />
                  </div>
                </AppCard>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
