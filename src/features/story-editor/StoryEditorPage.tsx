import { useParams, useNavigate } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader } from '@/shared/components'
import { StoryReadOnlyView } from '@/features/stories/components/StoryReadOnlyView'
import type { StoryLoadErrorPresentation } from '@/features/story-generator/lib/story-route-guards'
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
import { StoryEditProvider } from './StoryEditProvider'
import { useStoryEditContext } from './storyEditContext'
import { useStoryEditingToolbar } from './hooks/useStoryEditingToolbar'
import { useStoryEditorViewMode } from './hooks/useStoryEditorViewMode'
import { StoryPageByPageEditor } from './components/StoryPageByPageEditor'
import { StoryEditingToolbar } from './components/StoryEditingToolbar'
import { StoryEditorViewSwitcher } from './components/StoryEditorViewSwitcher'

function StoryEditorPageContent() {
  const {
    storyId,
    draft,
    editorState,
    editedStory,
    hasChanges,
    confirmLeave,
    isSaving,
    autosaveStatus,
    cancelScheduledSave,
    resetChanges,
    replaceEditable,
    saveDraft,
    reloadStory,
    updateMetadata,
    updatePageText,
    updateTeachingFocus,
    updateFlashcard,
    addFlashcard,
    removeFlashcard,
    moveFlashcard,
    updateImagePrompt,
    moveImagePrompt,
    regenerateImagePrompt,
    addPage,
    removePage,
    movePage,
  } = useStoryEditContext()

  const {
    summaries: historySummaries,
    history: storyHistory,
    isLoading: historyLoading,
    refresh: refreshHistory,
    restoreEntry,
    compareEntries,
    compareEntryToCurrent,
  } = useStoryHistory({
    storyId: draft?.id ?? storyId,
    currentStory: editedStory,
  })

  const saveEdits = useCallback(async () => {
    const saved = await saveDraft?.()
    if (saved) {
      await refreshHistory()
    }
    return saved ?? false
  }, [refreshHistory, saveDraft])

  const viewMode = useStoryEditorViewMode({ previewSource: editedStory })

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
    restoreOriginal: resetChanges,
    onSaveSuccess: () => {
      reloadStory()
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

  if (!editedStory || !editorState) {
    return null
  }

  return (
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
                      onTeachingFocusChange={updateTeachingFocus}
                      onAddPage={addPage}
                      onRemovePage={removePage}
                      onMovePage={movePage}
                      onImagePromptChange={updateImagePrompt}
                      onRegenerateImagePrompt={regenerateImagePrompt}
                      onMoveImagePrompt={moveImagePrompt}
                      onFlashcardChange={updateFlashcard}
                      onAddFlashcard={addFlashcard}
                      onRemoveFlashcard={removeFlashcard}
                      onMoveFlashcard={moveFlashcard}
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
  )
}

/**
 * Dedicated editing page — separate from generation preview and read-only detail view.
 * Loads generated content into an editable session; persistence stays in storyStorageApi.
 */
export function StoryEditorPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()
  const { status, data, presentation, isAuthLoading, reload } = useStoryDetail(storyId)

  const isGenerated = data?.kind === 'generated'
  const draft = data?.draft ?? null
  const sourceGeneratedStory = isGenerated && data ? data.generatedStory : null

  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const [validationErrors, setValidationErrors] = useState<StorySaveValidationResult | null>(null)

  const handleBackToStory = useCallback(() => {
    if (storyId) {
      navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
    }
  }, [navigate, storyId])

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

          {isGenerated && sourceGeneratedStory && (
            <StoryEditProvider
              storyId={storyId ?? draft.id}
              draft={draft}
              generatedStory={sourceGeneratedStory}
              enabled={isGenerated}
              onReload={reload}
              onPersisted={() => {
                void reload()
              }}
              onActionError={setActionError}
              onValidationFailed={(result) => {
                setValidationErrors(result)
                setActionError(null)
              }}
            >
              <StoryEditorPageContent />
            </StoryEditProvider>
          )}
        </>
      )}
    </StoryDetailLoadGuard>
  )
}
