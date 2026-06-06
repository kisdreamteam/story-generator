import { useCallback, useState } from 'react'
import type { EditableStoryContent } from '../types'
import type { EditablePageCommit } from '../types/editablePage.types'
import { EditableStoryPageCard } from './EditableStoryPageCard'
import { confirmDiscardUnsavedChanges } from '@/features/stories/lib/unsavedStoryChanges'

interface EditableStoryPagesEditorProps {
  story: EditableStoryContent
  disabled?: boolean
  onCommitPage: (commit: EditablePageCommit) => void
  onPageEditDirtyChange?: (pageNumber: number | null, isDirty: boolean) => void
}

function findImagePrompt(story: EditableStoryContent, pageNumber: number) {
  return story.imagePrompts.find((item) => item.pageNumber === pageNumber) ?? null
}

/**
 * Renders one editable card per page in story order.
 * Only one page can be in edit mode at a time to avoid losing unsaved card edits.
 */
export function EditableStoryPagesEditor({
  story,
  disabled = false,
  onCommitPage,
  onPageEditDirtyChange,
}: EditableStoryPagesEditorProps) {
  const [editingPageNumber, setEditingPageNumber] = useState<number | null>(null)
  const [editingPageDirty, setEditingPageDirty] = useState(false)

  const sortedPages = [...story.storyPages].sort((a, b) => a.pageNumber - b.pageNumber)

  const requestEdit = useCallback(
    (pageNumber: number) => {
      if (editingPageNumber !== null && editingPageNumber !== pageNumber && editingPageDirty) {
        if (!confirmDiscardUnsavedChanges('You have unsaved edits on another page. Discard them?')) {
          return
        }
      }

      setEditingPageNumber(pageNumber)
      setEditingPageDirty(false)
      onPageEditDirtyChange?.(pageNumber, false)
    },
    [editingPageNumber, editingPageDirty, onPageEditDirtyChange],
  )

  const handleCancelEdit = useCallback(
    (pageNumber: number) => {
      if (editingPageNumber === pageNumber) {
        setEditingPageNumber(null)
        setEditingPageDirty(false)
        onPageEditDirtyChange?.(null, false)
      }
    },
    [editingPageNumber, onPageEditDirtyChange],
  )

  const handleSavePage = useCallback(
    (commit: EditablePageCommit) => {
      onCommitPage(commit)
      setEditingPageNumber(null)
      setEditingPageDirty(false)
      onPageEditDirtyChange?.(null, false)
    },
    [onCommitPage, onPageEditDirtyChange],
  )

  return (
    <div className="space-y-4">
      {sortedPages.map((page) => {
        const isEditing = editingPageNumber === page.pageNumber
        const includesFlashcards = page.pageNumber === sortedPages[0]?.pageNumber

        return (
          <EditableStoryPageCard
            key={page.pageNumber}
            model={{
              page,
              imagePrompt: findImagePrompt(story, page.pageNumber),
              flashcards: includesFlashcards ? story.flashcards : undefined,
            }}
            isEditing={isEditing}
            editBlocked={editingPageNumber !== null && !isEditing}
            disabled={disabled}
            includesFlashcards={includesFlashcards && story.flashcards.length > 0}
            onStartEdit={() => requestEdit(page.pageNumber)}
            onCancelEdit={() => handleCancelEdit(page.pageNumber)}
            onSave={handleSavePage}
            onDirtyChange={(dirty) => {
              if (isEditing) {
                setEditingPageDirty(dirty)
                onPageEditDirtyChange?.(page.pageNumber, dirty)
              }
            }}
          />
        )
      })}
    </div>
  )
}
