import { useCallback, useRef, useState } from 'react'
import type { EditableStoryContent } from '../types'

export type StoryEditorViewMode = 'edit' | 'preview'

export const STORY_EDITOR_EDIT_PANEL_ID = 'story-editor-edit-panel'
export const STORY_EDITOR_PREVIEW_PANEL_ID = 'story-editor-preview-panel'

export interface UseStoryEditorViewModeOptions {
  /** Working copy — snapshotted when entering preview so preview updates only on demand. */
  previewSource?: EditableStoryContent | null
  initialMode?: StoryEditorViewMode
}

export interface UseStoryEditorViewModeResult {
  mode: StoryEditorViewMode
  isPreviewMode: boolean
  isEditMode: boolean
  /** Frozen snapshot for the read-only panel — refreshed when entering preview mode. */
  previewStory: EditableStoryContent | null
  setEditMode: () => void
  enterPreview: () => void
  toggleMode: () => void
}

function readWindowScrollY(): number {
  if (typeof window === 'undefined') return 0
  return window.scrollY
}

function restoreWindowScrollY(scrollY: number): void {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
}

function scheduleScrollRestore(scrollY: number): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      restoreWindowScrollY(scrollY)
    })
  })
}

/**
 * Edit / preview mode for the story editor.
 * Preserves per-mode window scroll and keeps unsaved session edits in the editor hook.
 */
export function useStoryEditorViewMode({
  previewSource = null,
  initialMode = 'edit',
}: UseStoryEditorViewModeOptions = {}): UseStoryEditorViewModeResult {
  const [mode, setMode] = useState<StoryEditorViewMode>(initialMode)
  const [previewStory, setPreviewStory] = useState<EditableStoryContent | null>(null)

  const editScrollRef = useRef(0)
  const previewScrollRef = useRef(0)
  const previewSourceRef = useRef(previewSource)
  previewSourceRef.current = previewSource

  const switchTo = useCallback((next: StoryEditorViewMode) => {
    setMode((current) => {
      if (current === next) return current

      if (current === 'edit') {
        editScrollRef.current = readWindowScrollY()
      } else {
        previewScrollRef.current = readWindowScrollY()
      }

      scheduleScrollRestore(next === 'edit' ? editScrollRef.current : previewScrollRef.current)
      return next
    })
  }, [])

  const setEditMode = useCallback(() => {
    switchTo('edit')
  }, [switchTo])

  const enterPreview = useCallback(() => {
    const source = previewSourceRef.current
    if (source) {
      setPreviewStory(source)
    }
    switchTo('preview')
  }, [switchTo])

  const toggleMode = useCallback(() => {
    if (mode === 'edit') {
      enterPreview()
    } else {
      setEditMode()
    }
  }, [enterPreview, mode, setEditMode])

  return {
    mode,
    isPreviewMode: mode === 'preview',
    isEditMode: mode === 'edit',
    previewStory,
    setEditMode,
    enterPreview,
    toggleMode,
  }
}
