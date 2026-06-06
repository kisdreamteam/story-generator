import type { ReactNode } from 'react'
import type { StoryEditorViewMode } from '../hooks/useStoryEditorViewMode'
import {
  STORY_EDITOR_EDIT_PANEL_ID,
  STORY_EDITOR_PREVIEW_PANEL_ID,
} from '../hooks/useStoryEditorViewMode'

export interface StoryEditorViewSwitcherProps {
  mode: StoryEditorViewMode
  editView: ReactNode
  previewView: ReactNode
}

/**
 * Keeps edit and preview panels mounted so toggling modes does not remount story UI.
 * Hidden panels are inert and excluded from layout while preserving internal state.
 */
export function StoryEditorViewSwitcher({
  mode,
  editView,
  previewView,
}: StoryEditorViewSwitcherProps) {
  const isEdit = mode === 'edit'
  const isPreview = mode === 'preview'

  return (
    <>
      <div
        id={STORY_EDITOR_EDIT_PANEL_ID}
        hidden={!isEdit}
        inert={!isEdit}
        aria-hidden={!isEdit}
        className={isEdit ? 'space-y-6' : undefined}
      >
        {editView}
      </div>
      <div
        id={STORY_EDITOR_PREVIEW_PANEL_ID}
        hidden={!isPreview}
        inert={!isPreview}
        aria-hidden={!isPreview}
      >
        {previewView}
      </div>
    </>
  )
}
