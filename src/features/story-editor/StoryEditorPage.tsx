import { useParams, useNavigate } from 'react-router-dom'
import { AppButton, AppEmptyState, AppErrorState, PageHeader } from '@/shared/components'
import { StoryReadOnlyView } from '@/features/stories/components/StoryReadOnlyView'
import type { StoryLoadErrorPresentation } from '@/features/story-generator/lib/story-route-guards'
import { classifyStoryLoadError } from '@/features/story-generator/lib/story-route-guards'
import {
  StoryDetailLoadGuard,
  useStoryDetail,
  type GeneratedStory,
} from '@/features/stories'
import {
  getStorySaveValidationMessages,
  isStorySaveValidationFailure,
  type StorySaveValidationResult,
} from '@/features/stories/utils/storyValidation'
import {
  isStorySaveConflictError,
  type StorySaveBaseline,
} from '@/features/stories/utils/storySaveConflict'
import { storyFeedback } from '@/shared/feedback'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  STORY_HISTORY_ELEMENT_ID,
  StoryHistoryPanel,
  useStoryHistory,
  wouldRestoreStoryHistoryChangeContent,
} from '@/features/story-history'
import { saveStoryEditorChanges, saveStoryEditorChangesAsCopy } from './api/saveStoryEditorChanges'
import { StoryEditor } from './StoryEditor'
import { useStoryEditorViewMode } from './hooks/useStoryEditorViewMode'
import { StoryEditorViewSwitcher } from './components/StoryEditorViewSwitcher'
import { StoryEditorModeToggle } from './components/StoryEditorModeToggle'
import { cloneEditableStory } from './utils'

function StoryEditorPageHistory({
  storyId,
  editedStory,
  hasChanges,
  isSaving,
  onReplaceStory,
}: {
  storyId: string
  editedStory: GeneratedStory
  hasChanges: boolean
  isSaving: boolean
  onReplaceStory: (story: GeneratedStory) => void
}) {
  const {
    summaries: historySummaries,
    history: storyHistory,
    isLoading: historyLoading,
    restoreEntry,
    compareEntries,
    compareEntryToCurrent,
  } = useStoryHistory({
    storyId,
    currentStory: editedStory,
  })

  function handleRestoreHistoryEntry(entryId: string) {
    if (!wouldRestoreStoryHistoryChangeContent(editedStory, entryId, storyHistory)) {
      return
    }

    if (
      hasChanges &&
      !window.confirm('Restore this version? Your current unsaved edits will be replaced.')
    ) {
      return
    }

    const restored = restoreEntry(entryId)
    if (restored) {
      onReplaceStory(restored)
    }
  }

  return (
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
  )
}

/**
 * Dedicated editing page — separate from generation preview and read-only detail view.
 * Uses manual save only; the original generated story is unchanged until Save succeeds.
 */
export function StoryEditorPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()
  const { status, data, presentation, isAuthLoading, reload } = useStoryDetail(storyId)

  const isGenerated = data?.kind === 'generated'
  const draft = data?.draft ?? null
  const sourceGeneratedStory = isGenerated && data ? data.generatedStory : null

  const [baselineStory, setBaselineStory] = useState<GeneratedStory | null>(sourceGeneratedStory)
  const [workingStory, setWorkingStory] = useState<GeneratedStory | null>(sourceGeneratedStory)
  const [editorRevision, setEditorRevision] = useState(0)
  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const [validationErrors, setValidationErrors] = useState<StorySaveValidationResult | null>(null)
  const [hasEditorChanges, setHasEditorChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveBaseline, setSaveBaseline] = useState<StorySaveBaseline>({})
  const [savedCreatedAt, setSavedCreatedAt] = useState<string | undefined>()
  const [savedUpdatedAt, setSavedUpdatedAt] = useState<string | undefined>()

  useEffect(() => {
    if (sourceGeneratedStory) {
      setBaselineStory(sourceGeneratedStory)
      setWorkingStory(sourceGeneratedStory)
    }
  }, [sourceGeneratedStory])

  useEffect(() => {
    if (!draft) return

    setSaveBaseline({
      expectedUpdatedAt: draft.updatedAt,
      expectedVersion: draft.version,
    })
    setSavedCreatedAt(draft.createdAt)
    setSavedUpdatedAt(draft.updatedAt)
  }, [draft?.createdAt, draft?.id, draft?.updatedAt, draft?.version])

  const saveBaselineForEditor = useMemo(() => saveBaseline, [saveBaseline])

  const viewMode = useStoryEditorViewMode({ previewSource: workingStory })

  const handleBackToStory = useCallback(() => {
    if (storyId) {
      navigate(`/dashboard/stories/${encodeURIComponent(storyId)}`)
    }
  }, [navigate, storyId])

  const handleSave = useCallback(
    async (editedStory: GeneratedStory) => {
      if (!draft) {
        return
      }

      setIsSaving(true)
      setActionError(null)
      setValidationErrors(null)

      try {
        const { story, project } = await saveStoryEditorChanges(draft.id, editedStory, saveBaseline)
        const saved = cloneEditableStory(story)
        setBaselineStory(saved)
        setWorkingStory(saved)
        setSaveBaseline({
          expectedUpdatedAt: project.updatedAt,
          expectedVersion: project.version,
        })
        setSavedUpdatedAt(project.updatedAt)
        setEditorRevision((value) => value + 1)
        reload()
        storyFeedback.storyUpdated()
      } catch (error) {
        if (isStorySaveValidationFailure(error)) {
          setValidationErrors(error.result)
          setActionError(null)
          throw error
        }

        if (isStorySaveConflictError(error)) {
          setActionError({
            title: 'Story changed elsewhere',
            description: error.message,
          })
          throw error
        }

        setActionError(classifyStoryLoadError(error))
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [draft, reload, saveBaseline],
  )

  const handleSaveAsCopy = useCallback(
    async (editedStory: GeneratedStory) => {
      if (!draft) {
        return
      }

      setIsSaving(true)
      setActionError(null)
      setValidationErrors(null)

      try {
        const { project } = await saveStoryEditorChangesAsCopy(draft.id, editedStory)
        storyFeedback.storySavedAsCopy(project.title)
        navigate(`/dashboard/stories/${encodeURIComponent(project.id)}/edit`)
      } catch (error) {
        if (isStorySaveValidationFailure(error)) {
          setValidationErrors(error.result)
          setActionError(null)
          throw error
        }

        setActionError(classifyStoryLoadError(error))
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [draft, navigate],
  )

  const handleHistoryRestore = useCallback((restored: GeneratedStory) => {
    const next = cloneEditableStory(restored)
    setBaselineStory(next)
    setWorkingStory(next)
    setEditorRevision((value) => value + 1)
  }, [])

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
            description="Edit your generated story, then save when you are ready. Cancel restores the last saved version."
          />

          {validationErrors && !validationErrors.isValid && (
            <div className="mb-4">
              <AppErrorState
                variant="inline"
                tone="warning"
                title="Fix these issues before saving"
                description={getStorySaveValidationMessages(validationErrors).join(' ')}
              />
            </div>
          )}

          {actionError && (
            <div className="mb-4 space-y-2">
              <AppErrorState presentation={actionError} variant="inline" />
              {actionError.title === 'Story changed elsewhere' ? (
                <AppButton type="button" variant="secondary" onClick={() => reload()}>
                  Reload story
                </AppButton>
              ) : null}
            </div>
          )}

          {!isGenerated && (
            <AppEmptyState kind="story-not-generated" onAction={handleBackToStory} />
          )}

          {isGenerated && baselineStory && workingStory && (
            <div className="space-y-4">
              <StoryEditorModeToggle
                mode={viewMode.mode}
                onModeChange={(mode) => {
                  if (mode === 'preview') {
                    viewMode.enterPreview()
                  } else {
                    viewMode.setEditMode()
                  }
                }}
                disabled={isSaving}
              />

              <StoryEditorViewSwitcher
                mode={viewMode.mode}
                editView={
                  <StoryEditor
                    key={`${draft.id}-${editorRevision}`}
                    story={baselineStory}
                    storyId={draft.id}
                    projectTitle={draft.title}
                    disabled={isSaving}
                    saveBaseline={saveBaselineForEditor}
                    savedCreatedAt={savedCreatedAt}
                    savedUpdatedAt={savedUpdatedAt}
                    onSave={handleSave}
                    onSaveAsCopy={handleSaveAsCopy}
                    onCancel={handleBackToStory}
                    onChange={({ editedStory, hasChanges }) => {
                      if (editedStory) {
                        setWorkingStory(editedStory)
                      }
                      setHasEditorChanges(hasChanges)
                    }}
                    accessory={
                      <StoryEditorPageHistory
                        storyId={draft.id}
                        editedStory={workingStory}
                        hasChanges={hasEditorChanges}
                        isSaving={isSaving}
                        onReplaceStory={handleHistoryRestore}
                      />
                    }
                  />
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
