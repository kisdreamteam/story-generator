import { useState } from 'react'
import { AppCard } from '@/shared/components'
import type { StoryFlashcard, StoryImagePrompt } from '@/features/stories/types'
import type { StoryEditorMetadata, StoryEditorState } from '../types/storyEditorState.types'
import { FlashcardEditor } from './FlashcardEditor'
import { ImagePromptEditor } from './ImagePromptEditor'
import { StoryMetadataEditor } from './StoryMetadataEditor'
import { StoryPageListEditor } from './StoryPageListEditor'

export interface StoryPageByPageEditorProps {
  editorState: StoryEditorState
  disabled?: boolean
  onMetadataChange: (patch: Partial<StoryEditorMetadata>) => void
  onPageTextChange: (pageNumber: number, text: string) => void
  onTeachingFocusChange?: (pageNumber: number, teachingFocus: string) => void
  onAddPage: (afterPageNumber?: number) => void
  onRemovePage: (pageNumber: number) => void
  onMovePage: (pageNumber: number, direction: 'up' | 'down') => void
  onImagePromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  onRegenerateImagePrompt: (pageNumber: number) => void
  onMoveImagePrompt: (pageNumber: number, direction: 'up' | 'down') => void
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
  onAddFlashcard: (afterIndex?: number) => void
  onRemoveFlashcard: (index: number) => void
  onMoveFlashcard: (index: number, direction: 'up' | 'down') => void
  className?: string
}

/**
 * Page-by-page editing surface — updates editor state via callbacks only.
 */
export function StoryPageByPageEditor({
  editorState,
  disabled = false,
  onMetadataChange,
  onPageTextChange,
  onTeachingFocusChange,
  onAddPage,
  onRemovePage,
  onMovePage,
  onImagePromptChange,
  onRegenerateImagePrompt,
  onMoveImagePrompt,
  onFlashcardChange,
  onAddFlashcard,
  onRemoveFlashcard,
  onMoveFlashcard,
  className = '',
}: StoryPageByPageEditorProps) {
  const sortedPages = [...editorState.pages].sort((left, right) => left.pageNumber - right.pageNumber)
  const firstPageNumber = sortedPages[0]?.pageNumber

  const [selectedPageNumber, setSelectedPageNumber] = useState<number | null>(
    () => sortedPages[0]?.pageNumber ?? null,
  )

  const activePageNumber =
    selectedPageNumber && sortedPages.some((page) => page.pageNumber === selectedPageNumber)
      ? selectedPageNumber
      : sortedPages[0]?.pageNumber

  if (!activePageNumber) {
    return null
  }

  const showFlashcards = firstPageNumber !== undefined && activePageNumber === firstPageNumber

  return (
    <div className={['space-y-6', className].filter(Boolean).join(' ')}>
      <AppCard padding="md" className="border-stone-200 bg-white">
        <StoryMetadataEditor
          metadata={editorState.metadata}
          disabled={disabled}
          onTitleChange={(title) => onMetadataChange({ title })}
        />
      </AppCard>

      <StoryPageListEditor
        pages={editorState.pages}
        disabled={disabled}
        selectedPageNumber={activePageNumber}
        onSelectPage={setSelectedPageNumber}
        onTextChange={onPageTextChange}
        onTeachingFocusChange={onTeachingFocusChange}
        onAddPage={onAddPage}
        onRemovePage={onRemovePage}
        onMovePage={onMovePage}
      />

      <AppCard padding="md" className="border-stone-200 bg-white">
        <ImagePromptEditor
          pages={editorState.pages}
          imagePrompts={editorState.imagePrompts}
          disabled={disabled}
          selectedPageNumber={activePageNumber}
          onSelectPage={setSelectedPageNumber}
          onPromptChange={onImagePromptChange}
          onRegeneratePrompt={onRegenerateImagePrompt}
          onMovePrompt={onMoveImagePrompt}
        />
      </AppCard>

      {showFlashcards ? (
        <AppCard padding="md" className="border-stone-200 bg-white">
          <FlashcardEditor
            flashcards={editorState.flashcards}
            disabled={disabled}
            onFlashcardChange={onFlashcardChange}
            onAddFlashcard={onAddFlashcard}
            onRemoveFlashcard={onRemoveFlashcard}
            onMoveFlashcard={onMoveFlashcard}
          />
        </AppCard>
      ) : null}
    </div>
  )
}
