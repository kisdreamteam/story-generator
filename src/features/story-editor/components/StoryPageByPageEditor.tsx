import { AppCard } from '@/shared/components'
import type { StoryFlashcard, StoryImagePrompt } from '@/features/stories/types'
import type { StoryEditorMetadata, StoryEditorState } from '../types/storyEditorState.types'
import { useStoryPageNavigation } from '../hooks/useStoryPageNavigation'
import { FlashcardEditor } from './FlashcardEditor'
import { ImagePromptEditor } from './ImagePromptEditor'
import { StoryMetadataEditor } from './StoryMetadataEditor'
import { StoryPageEditor } from './StoryPageEditor'
import { StoryPageNavigation } from './StoryPageNavigation'

export interface StoryPageByPageEditorProps {
  editorState: StoryEditorState
  disabled?: boolean
  onMetadataChange: (patch: Partial<StoryEditorMetadata>) => void
  onPageTextChange: (pageNumber: number, text: string) => void
  onImagePromptChange: (pageNumber: number, patch: Partial<StoryImagePrompt>) => void
  onFlashcardChange: (index: number, patch: Partial<StoryFlashcard>) => void
  className?: string
}

function findImagePrompt(state: StoryEditorState, pageNumber: number): StoryImagePrompt {
  return (
    state.imagePrompts.find((item) => item.pageNumber === pageNumber) ?? {
      pageNumber,
      prompt: '',
      continuityReminder: '',
    }
  )
}

/**
 * Page-by-page editing surface — updates editor state via callbacks only.
 */
export function StoryPageByPageEditor({
  editorState,
  disabled = false,
  onMetadataChange,
  onPageTextChange,
  onImagePromptChange,
  onFlashcardChange,
  className = '',
}: StoryPageByPageEditorProps) {
  const navigation = useStoryPageNavigation(editorState.pages)
  const currentPage = navigation.currentPage

  if (!currentPage) {
    return null
  }

  const firstPageNumber = navigation.sortedPages[0]?.pageNumber
  const showFlashcards =
    firstPageNumber !== undefined && currentPage.pageNumber === firstPageNumber

  const imagePrompt = findImagePrompt(editorState, currentPage.pageNumber)

  return (
    <div className={['space-y-6', className].filter(Boolean).join(' ')}>
      <AppCard padding="md" className="border-stone-200 bg-white">
        <StoryMetadataEditor
          metadata={editorState.metadata}
          disabled={disabled}
          onTitleChange={(title) => onMetadataChange({ title })}
        />
      </AppCard>

      <StoryPageNavigation
        currentPageNumber={currentPage.pageNumber}
        currentIndex={navigation.currentIndex}
        totalPages={navigation.totalPages}
        canGoPrevious={navigation.canGoPrevious}
        canGoNext={navigation.canGoNext}
        onPrevious={navigation.goPrevious}
        onNext={navigation.goNext}
        disabled={disabled}
      />

      <AppCard padding="md" className="space-y-6 border-stone-200 bg-white">
        <StoryPageEditor
          page={currentPage}
          disabled={disabled}
          onTextChange={(text) => onPageTextChange(currentPage.pageNumber, text)}
        />

        <ImagePromptEditor
          pageNumber={currentPage.pageNumber}
          imagePrompt={imagePrompt}
          disabled={disabled}
          onPromptChange={(prompt) =>
            onImagePromptChange(currentPage.pageNumber, { prompt })
          }
          onContinuityChange={(continuityReminder) =>
            onImagePromptChange(currentPage.pageNumber, { continuityReminder })
          }
        />

        {showFlashcards ? (
          <FlashcardEditor
            flashcards={editorState.flashcards}
            disabled={disabled}
            onFlashcardChange={onFlashcardChange}
          />
        ) : null}
      </AppCard>
    </div>
  )
}
