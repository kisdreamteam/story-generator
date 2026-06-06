import { useParams } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader } from '@/shared/components'
import { StoryReadOnlyView } from '@/features/stories/components/StoryReadOnlyView'
import {
  classifyStoryLoadError,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import {
  StoryDetailLoadGuard,
  useStoryDetail,
} from '@/features/stories'
import {
  getStorySaveValidationMessages,
  type StorySaveValidationResult,
} from '@/features/stories/utils/storyValidation'
import { useCallback, useState } from 'react'
import {
  STORY_HISTORY_ELEMENT_ID,
  StoryHistoryPanel,
  useStoryHistory,
  wouldRestoreStoryHistoryChangeContent,
} from '@/features/story-history'
import { useStoryEditor } from './hooks/useStoryEditor'
import { useStoryDirtyState } from './hooks/useStoryDirtyState'
import { useStoryAutosave } from './hooks/useStoryAutosave'
import { useStoryEditingToolbar } from './hooks/useStoryEditingToolbar'
import { useStoryEditorViewMode } from './hooks/useStoryEditorViewMode'
import { StoryPageByPageEditor } from './components/StoryPageByPageEditor'
import { StoryEditingToolbar } from './components/StoryEditingToolbar'
import { StoryEditorViewSwitcher } from './components/StoryEditorViewSwitcher'

/**
 * Dedicated editing page — separate from generation preview and read-only detail view.
 * Loads generated content into an editable session; persistence stays in storyStorageApi.
 */
export function StoryEditorPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const { status, data, presentation, isAuthLoading, reload } = useStoryDetail(storyId)

  const isGenerated = data?.kind === 'generated'
  const draft = data?.draft ?? null
  const sourceGeneratedStory = isGenerated && data ? data.generatedStory : null

  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const [validationErrors, setValidationErrors] = useState<StorySaveValidationResult | null>(null)

  const {
    session,
    editorState,
    editedStory,
    isDirty,
    revision,
    updateMetadata,
    updatePageText,
    updateFlashcard,
    updateImagePrompt,
    restoreOriginal,
    replaceEditable,
    markPersisted,
  } = useStoryEditor(sourceGeneratedStory, {
    enabled: isGenerated,
    storyId: storyId ?? '',
    projectTitle: draft?.title ?? '',
  })

  const {
    summaries: historySummaries,
    history: storyHistory,
    isLoading: historyLoading,
    refresh: refreshHistory,
    restoreEntry,
    compareEntries,
    compareEntryToCurrent,
  } = useStoryHistory({
    storyId: draft?.id ?? storyId ?? '',
    currentStory: editedStory,
  })

  const { status: autosaveStatus, isSaving, flushSave, cancelScheduledSave } = useStoryAutosave({
    storyId: draft?.id,
    editedStory,
    revision,
    isDirty,
    enabled: isGenerated && Boolean(draft),
    onPersisted: (savedStory) => {
      markPersisted(savedStory)
      void refreshHistory()
    },
    onError: (error) => setActionError(classifyStoryLoadError(error)),
    onValidationFailed: (result) => {
      setValidationErrors(result)
      setActionError(null)
    },
  })

  const saveEdits = useCallback(async () => {
    setActionError(null)
    setValidationErrors(null)
    const saved = await flushSave()
    if (saved) {
      await refreshHistory()
    }
    return saved
  }, [flushSave, refreshHistory])

  const viewMode = useStoryEditorViewMode({ previewSource: editedStory })

  const { hasChanges, confirmLeave } = useStoryDirtyState({
    originalState: session?.originalState ?? null,
    editorState,
    storyId,
  })

  const { toolbarProps } = useStoryEditingToolbar({
    storyId: storyId ?? draft?.id,
    hasChanges,
    confirmLeave,
    isSaving,
    autosaveStatus,
    revisionSummaries: historySummaries,
    mode: viewMode.mode,
    setEditMode: viewMode.setEditMode,
    enterPreview: viewMode.enterPreview,
    flushSave: saveEdits,
    cancelScheduledSave,
    restoreOriginal,
    onSaveSuccess: () => {
      reload()
      void refreshHistory()
    },
  })

  function handleRestoreHistoryEntry(entryId: string) {
    if (!editedStory) return

    if (!wouldRestoreStoryHistoryChangeContent(editedStory, entryId, storyHistory)) {
      return
    }

    if (
      hasChanges &&
      !confirmLeave('Restore this version? Your current unsaved edits will be replaced.')
    ) {
      return
    }

    const restored = restoreEntry(entryId)
    if (restored) {
      replaceEditable(restored)
    }
  }

  function handleBackToStory() {
    toolbarProps.onExit()
  }

  return (
    <StoryDetailLoadGuard
      status={status}
      presentation={presentation}
      isAuthLoading={isAuthLoading}
      pageTitle="Edit story"
      pageDescription="Edit pages, vocabulary, and illustration notes."
    >
      {draft && (
        <>
          <PageHeader
            title={`Edit: ${draft.title}`}
            description="Changes save automatically after you stop typing. You can also save manually before leaving."
          />

          {validationErrors && !validationErrors.isValid && (
            <div className="mb-4">
              <ErrorState
                variant="inline"
                tone="warning"
                title="Fix these issues before saving"
                description={getStorySaveValidationMessages(validationErrors).join(' ')}
              />
            </div>
          )}

          {actionError && (
            <div className="mb-4">
              <ErrorState
                variant="inline"
                tone="error"
                title={actionError.title}
                description={actionError.description}
              />
            </div>
          )}

          {!isGenerated && (
            <ErrorState
              variant="panel"
              title="This story is not ready to edit"
              description="Generate your classroom story first, then you can edit pages here."
            >
              <AppButton type="button" variant="secondary" onClick={handleBackToStory}>
                Back to story
              </AppButton>
            </ErrorState>
          )}

          {isGenerated && editedStory && editorState && (
            <div className="space-y-6">
              <StoryEditingToolbar {...toolbarProps} />

              <StoryEditorViewSwitcher
                mode={viewMode.mode}
                editView={
                  <>
                    <div id={STORY_HISTORY_ELEMENT_ID}>
                      <StoryHistoryPanel
                        entries={historySummaries}
                        onRestore={handleRestoreHistoryEntry}
                        compareEntries={compareEntries}
                        compareEntryToCurrent={compareEntryToCurrent}
                        currentStory={editedStory}
                        disabled={isSaving}
                        isLoading={historyLoading}
                      />
                    </div>

                    <StoryPageByPageEditor
                      editorState={editorState}
                      disabled={isSaving}
                      onMetadataChange={updateMetadata}
                      onPageTextChange={updatePageText}
                      onImagePromptChange={updateImagePrompt}
                      onFlashcardChange={updateFlashcard}
                    />
                  </>
                }
                previewView={
                  viewMode.previewStory ? (
                    <StoryReadOnlyView story={viewMode.previewStory} savedToLibrary />
                  ) : null
                }
              />
            </div>
          )}
        </>
      )}
    </StoryDetailLoadGuard>
  )
}
