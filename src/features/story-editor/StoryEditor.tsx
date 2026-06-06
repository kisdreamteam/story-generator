import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { GeneratedStory, StoryProject } from '@/features/stories/types'
import type { StorySaveBaseline } from '@/features/stories/utils/storySaveConflict'
import {
  saveStoryEditorChanges,
  saveStoryEditorChangesAsCopy,
} from './api/saveStoryEditorChanges'
import { useStoryDirtyState } from './hooks/useStoryDirtyState'
import { useStoryEditor } from './hooks/useStoryEditor'
import {
  StoryEditorToolbar,
  formatStoryEditorTimestamp,
} from './components/StoryEditorToolbar'
import { StoryPageByPageEditor } from './components/StoryPageByPageEditor'

export interface StoryEditorChangePayload {
  editedStory: GeneratedStory | null
  hasChanges: boolean
}

export interface StoryEditorProps {
  /** Immutable source — edits stay in a working copy until save. */
  story: GeneratedStory
  storyId: string
  projectTitle?: string
  disabled?: boolean
  /** Baseline used to detect stale saves and prevent accidental overwrite. */
  saveBaseline?: StorySaveBaseline
  /** Project `createdAt` / `updatedAt` shown in the toolbar (updated after save). */
  savedCreatedAt?: string
  savedUpdatedAt?: string
  /** Called on save. Defaults to {@link saveStoryEditorChanges}. */
  onSave?: (editedStory: GeneratedStory) => Promise<void>
  /** Called on save as copy. Defaults to {@link saveStoryEditorChangesAsCopy}. */
  onSaveAsCopy?: (editedStory: GeneratedStory) => Promise<StoryProject | void>
  /** Called after cancel confirms and working copy is restored. */
  onCancel?: () => void
  /** Called after a successful save. */
  onSaved?: (savedStory: GeneratedStory, project?: StoryProject) => void
  /** Called after a successful save as copy. */
  onSavedAsCopy?: (savedStory: GeneratedStory, project: StoryProject) => void
  /** Called when the working copy or dirty state changes. */
  onChange?: (payload: StoryEditorChangePayload) => void
  /** Optional content above the editing surface (e.g. version history). */
  accessory?: ReactNode
  className?: string
}

/**
 * Manual-save editor for generated stories.
 * Page text, vocabulary (flashcards), and illustration prompts edit in memory only until Save.
 */
export function StoryEditor({
  story,
  storyId,
  projectTitle = '',
  disabled = false,
  saveBaseline,
  savedCreatedAt,
  savedUpdatedAt,
  onSave,
  onSaveAsCopy,
  onCancel,
  onSaved,
  onSavedAsCopy,
  onChange,
  accessory,
  className = '',
}: StoryEditorProps) {
  const editor = useStoryEditor(story, { storyId, projectTitle, enabled: true })
  const { hasChanges, confirmLeave } = useStoryDirtyState({
    originalState: editor.session?.originalState ?? editor.editorState,
    editorState: editor.editorState,
    enabled: Boolean(editor.editorState),
    storyId,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isSavingCopy, setIsSavingCopy] = useState(false)

  useEffect(() => {
    onChange?.({
      editedStory: editor.editedStory,
      hasChanges,
    })
  }, [editor.editedStory, hasChanges, onChange])

  const handleSaveChanges = useCallback(async () => {
    if (!editor.editedStory || !hasChanges || isSaving || isSavingCopy || disabled) {
      return
    }

    setIsSaving(true)

    try {
      if (onSave) {
        await onSave(editor.editedStory)
        editor.markPersisted(editor.editedStory)
        onSaved?.(editor.editedStory)
      } else {
        const { project, story: savedStory } = await saveStoryEditorChanges(
          storyId,
          editor.editedStory,
          saveBaseline,
        )
        editor.markPersisted(savedStory)
        onSaved?.(savedStory, project)
      }
    } catch {
      // Keep dirty state when save fails.
    } finally {
      setIsSaving(false)
    }
  }, [
    disabled,
    editor,
    hasChanges,
    isSaving,
    isSavingCopy,
    onSave,
    onSaved,
    saveBaseline,
    storyId,
  ])

  const handleSaveAsCopy = useCallback(async () => {
    if (!editor.editedStory || !hasChanges || isSaving || isSavingCopy || disabled) {
      return
    }

    setIsSavingCopy(true)

    try {
      const saveCopy =
        onSaveAsCopy ??
        ((editedStory) => saveStoryEditorChangesAsCopy(storyId, editedStory).then(({ project }) => project))
      const project = await saveCopy(editor.editedStory)
      if (project) {
        onSavedAsCopy?.(editor.editedStory, project)
      }
    } catch {
      // Keep dirty state when save fails.
    } finally {
      setIsSavingCopy(false)
    }
  }, [disabled, editor, hasChanges, isSaving, isSavingCopy, onSaveAsCopy, onSavedAsCopy, storyId])

  const handleCancel = useCallback(() => {
    if (isSaving || isSavingCopy) {
      return
    }

    if (hasChanges && !confirmLeave('Discard unsaved changes?')) {
      return
    }

    editor.restoreOriginal()
    onCancel?.()
  }, [confirmLeave, editor, hasChanges, isSaving, isSavingCopy, onCancel])

  if (!editor.editorState || !editor.editedStory) {
    return null
  }

  const isDisabled = disabled || isSaving || isSavingCopy

  return (
    <div className={['space-y-6', className].filter(Boolean).join(' ')}>
      <StoryEditorToolbar
        hasUnsavedChanges={hasChanges}
        isSaving={isSaving}
        isSavingCopy={isSavingCopy}
        canSave={hasChanges && !isDisabled}
        canSaveAsCopy={hasChanges && !isDisabled}
        onSaveChanges={() => {
          void handleSaveChanges()
        }}
        onSaveAsCopy={() => {
          void handleSaveAsCopy()
        }}
        onCancel={handleCancel}
        createdAtLabel={formatStoryEditorTimestamp(savedCreatedAt)}
        updatedAtLabel={formatStoryEditorTimestamp(savedUpdatedAt)}
      />

      {accessory}

      <StoryPageByPageEditor
        editorState={editor.editorState}
        disabled={isDisabled}
        onMetadataChange={editor.updateMetadata}
        onPageTextChange={editor.updatePageText}
        onTeachingFocusChange={editor.updateTeachingFocus}
        onAddPage={editor.addPage}
        onRemovePage={editor.removePage}
        onMovePage={editor.movePage}
        onImagePromptChange={editor.updateImagePrompt}
        onRegenerateImagePrompt={editor.regenerateImagePrompt}
        onMoveImagePrompt={editor.moveImagePrompt}
        onFlashcardChange={editor.updateFlashcard}
        onAddFlashcard={editor.addFlashcard}
        onRemoveFlashcard={editor.removeFlashcard}
        onMoveFlashcard={editor.moveFlashcard}
      />
    </div>
  )
}
