import { AppCard, AppInput, AppTextarea } from '@/shared/components'
import type { StoryFlashcard } from '@/features/stories/types'

export interface FlashcardEditorProps {
  flashcards: StoryFlashcard[]
  disabled?: boolean
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
  className?: string
}

export function FlashcardEditor({
  flashcards,
  disabled = false,
  onFlashcardChange,
  className = '',
}: FlashcardEditorProps) {
  if (flashcards.length === 0) {
    return null
  }

  return (
    <div className={['space-y-3', className].filter(Boolean).join(' ')}>
      <h3 className="text-sm font-semibold text-stone-900">Vocabulary cards</h3>
      <ul className="space-y-3">
        {flashcards.map((card, index) => (
          <li key={index}>
            <AppCard padding="md" className="border-stone-200 bg-white">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
                Card {index + 1}
              </p>
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
                <AppInput
                  label="Example sentence"
                  value={card.exampleSentence}
                  onChange={(event) =>
                    onFlashcardChange(index, { exampleSentence: event.target.value })
                  }
                  disabled={disabled}
                />
              </div>
            </AppCard>
          </li>
        ))}
      </ul>
    </div>
  )
}
