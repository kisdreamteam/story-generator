import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader } from '@/shared/components'
import { dashboardPageStackClass } from '@/shared/styles/pageShellClasses'
import { panelShellClass } from '@/shared/styles/surfaceClasses'
import {
  classifyStoryDeleteError,
  classifyStoryLoadError,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import {
  getStorySaveValidationMessages,
  isStorySaveValidationFailure,
} from '@/features/stories/utils/storyValidation'
import { isStorySaveConflictError } from '@/features/stories/utils/storySaveConflict'
import { storyFeedback } from '@/shared/feedback'
import { useAsyncMutation } from '@/shared/lib/mutations'
import { StoryEditForm, withRecalculatedWordCounts, type GeneratedStory } from '@/features/stories'
import { saveStoryEditorChanges, saveStoryEditorChangesAsCopy } from '@/features/story-editor/api/saveStoryEditorChanges'
import {
  ImagePromptReviewPanel,
  StoryImageGenerationPanel,
  haveStoryPageImagesChanged,
  isStoryPageImageReady,
  useImagePromptReview,
  useStoryPageImageGeneration,
} from '@/features/story-images'
import { StoryPageImageStatuses } from '@/features/story-images/types'
import {
  AssignStoryToClassroomPanel,
  StoryClassroomsSection,
  useAssignStoryToClassroom,
} from '@/features/classrooms'
import { StoryExportActions } from '@/features/story-export'
import { deleteStory, duplicateStory, archiveStory, unarchiveStory, markStoryCompleted } from '../api/storyStorageApi'
import { AppEmptyState } from '@/shared/components'
import { isStoryArchived, resolveStoryLifecycleStatus } from '../utils/storyLifecycleStatus'
import { confirmDeleteStory } from '../lib/confirmDeleteStory'
import { confirmArchiveStory, confirmUnarchiveStory } from '../lib/confirmArchiveStory'
import { StoryActionsBar, type StoryActionConfig } from '../components/StoryActionsBar'
import {
  StoryDetailModeBanner,
  StoryDetailNav,
  StoryFlashcards,
  StoryGeneratedContentSections,
  StoryHeader,
  StoryMetadata,
  StoryPages,
} from '../components/story-detail'
import { StoryDetailLoadGuard } from '../components/StoryDetailLoadGuard'
import { useStoryDetail } from '../hooks/useStoryDetail'
import { useStoryEditor, useStoryDirtyState } from '@/features/story-editor'
import { formatStoryDate } from '../utils/storyFormat'
import { formatStoryVersionBadge } from '../utils/storyVersionFormat'
import { getStoryProjectStatusLabel } from '@/features/story-generator'
import {
  buildStoryDetailFallbackFields,
  mapStorySetupReviewSections,
} from '../utils/storyDetailView'

export function StoryDetailPage() {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { status, data, presentation, isAuthLoading, reload } = useStoryDetail(storyId)

  const isGenerated = data?.kind === 'generated'
  const draft = data?.draft ?? null
  const sourceGeneratedStory = isGenerated && data ? data.generatedStory : null

  const [isEditing, setIsEditing] = useState(false)
  const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false)
  const [optimisticDisplayStory, setOptimisticDisplayStory] = useState<GeneratedStory | null>(null)
  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const mutation = useAsyncMutation()
  const isMutating = mutation.isPending
  const storyProjectId = draft?.id ?? storyId ?? ''

  const classroomAssignment = useAssignStoryToClassroom(isEditing ? undefined : storyProjectId)

  const {
    session,
    editorState,
    editedStory,
    updatePageText,
    updateFlashcard,
    updateImagePrompt,
    restoreOriginal,
  } = useStoryEditor(sourceGeneratedStory, {
    enabled: isEditing && isGenerated,
    storyId: draft?.id ?? storyId ?? '',
    projectTitle: draft?.title ?? '',
  })

  const { hasChanges, confirmLeave } = useStoryDirtyState({
    originalState: session?.originalState ?? null,
    editorState,
    enabled: isEditing,
    storyId,
  })

  useEffect(() => {
    if (!isGenerated || searchParams.get('edit') !== '1') return

    setIsEditing(true)
    setSearchParams({}, { replace: true })
  }, [isGenerated, searchParams, setSearchParams])

  function handleBackToStories() {
    navigate('/dashboard/stories')
  }

  function handleContinueInCreator() {
    if (!draft) return
    navigate(`/dashboard/create?draftId=${encodeURIComponent(draft.id)}`)
  }

  function handleOpenAdvancedEditor() {
    if (!storyId) return
    navigate(`/dashboard/stories/${encodeURIComponent(storyId)}/edit`)
  }

  function handleReadStory() {
    if (!storyId) return
    navigate(`/dashboard/stories/${storyId}/read`)
  }

  function handleOpenRoleplay() {
    if (!storyId) return
    navigate(`/dashboard/stories/${encodeURIComponent(storyId)}/roleplay`)
  }

  function handleViewStory() {
    if (isEditing) {
      if (hasChanges && !confirmLeave()) {
        return
      }

      restoreOriginal()
      setActionError(null)
      setIsEditing(false)
    }

    document.getElementById('story-detail-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleContinueEditing() {
    if (isGenerated) {
      handleEnterEditMode()
      return
    }

    handleContinueInCreator()
  }

  function handleEnterEditMode() {
    setActionError(null)
    setIsAssignPanelOpen(false)
    setIsEditing(true)
  }

  function handleCancelEditing() {
    if (hasChanges && !confirmLeave()) {
      return
    }

    restoreOriginal()
    setActionError(null)
    setIsEditing(false)
  }

  function handleSaveChanges() {
    if (!draft || !editedStory || isMutating || !hasChanges) return

    void mutation.run(
      () =>
        saveStoryEditorChanges(draft.id, editedStory, {
          expectedUpdatedAt: draft.updatedAt,
          expectedVersion: draft.version,
        }).then(({ story }) => story),
      {
        optimistic: () => {
          setActionError(null)
          setOptimisticDisplayStory(withRecalculatedWordCounts(editedStory))
          setIsEditing(false)
        },
        rollback: () => {
          setOptimisticDisplayStory(null)
          setIsEditing(true)
          storyFeedback.optimisticRollback('Your edits could not be saved. Edit mode was restored.')
        },
        onSuccess: () => {
          setOptimisticDisplayStory(null)
          reload()
          storyFeedback.storyUpdated()
        },
        onError: (error) => {
          if (isStorySaveValidationFailure(error)) {
            setActionError({
              title: 'Fix these issues before saving',
              description: getStorySaveValidationMessages(error.result).join(' '),
            })
            return
          }

          if (isStorySaveConflictError(error)) {
            setActionError({
              title: 'Story changed elsewhere',
              description: error.message,
            })
            return
          }

          const presentation = classifyStoryLoadError(error)
          setActionError(presentation)
          storyFeedback.cloudSyncFailed(presentation.description)
        },
      },
    )
  }

  function handleSaveAsCopy() {
    if (!draft || !editedStory || isMutating || !hasChanges) return

    void mutation.run(() => saveStoryEditorChangesAsCopy(draft.id, editedStory).then(({ project }) => project), {
      optimistic: () => {
        setActionError(null)
      },
      onSuccess: (project) => {
        storyFeedback.storySavedAsCopy(project.title)
        navigate(`/dashboard/stories/${encodeURIComponent(project.id)}`)
      },
      onError: (error) => {
        if (isStorySaveValidationFailure(error)) {
          setActionError({
            title: 'Fix these issues before saving',
            description: getStorySaveValidationMessages(error.result).join(' '),
          })
          return
        }

        const presentation = classifyStoryLoadError(error)
        setActionError(presentation)
        storyFeedback.cloudSyncFailed(presentation.description)
      },
    })
  }

  function handleMarkComplete() {
    if (!draft || isMutating || !isGenerated) return

    void mutation.run(() => markStoryCompleted(draft.id), {
      optimistic: () => {
        setActionError(null)
      },
      onSuccess: () => {
        reload()
        storyFeedback.storyCompleted(draft.title)
      },
      onError: (error) => {
        const presentation = classifyStoryLoadError(error)
        setActionError(presentation)
        storyFeedback.cloudSyncFailed(presentation.description)
      },
    })
  }

  function handleDeleteStory() {
    if (!draft || isMutating) return
    if (!confirmDeleteStory(draft.title)) return

    void mutation.run(() => deleteStory(draft.id), {
      optimistic: () => {
        setActionError(null)
      },
      onSuccess: () => {
        storyFeedback.storyDeleted(draft.title)
        navigate('/dashboard/stories')
      },
      onError: (error) => {
        const presentation = classifyStoryDeleteError(error)
        setActionError(presentation)
        storyFeedback.deleteFailed(presentation.description)
      },
    })
  }

  function handleSaveIllustrations() {
    if (!draft || !viewStory || isMutating || !hasUnsavedImages) return

    void mutation.run(
      () =>
        saveStoryEditorChanges(draft.id, viewStory, {
          expectedUpdatedAt: draft.updatedAt,
          expectedVersion: draft.version,
        }).then(({ story }) => story),
      {
        optimistic: () => {
          setActionError(null)
          setOptimisticDisplayStory(viewStory)
        },
        rollback: () => {
          setOptimisticDisplayStory(null)
          storyFeedback.optimisticRollback('Your illustrations could not be saved.')
        },
        onSuccess: () => {
          setOptimisticDisplayStory(null)
          reload()
          storyFeedback.storyUpdated('Your page illustrations were saved.')
        },
        onError: (error) => {
          if (isStorySaveValidationFailure(error)) {
            setActionError({
              title: 'Fix these issues before saving',
              description: getStorySaveValidationMessages(error.result).join(' '),
            })
            return
          }

          if (isStorySaveConflictError(error)) {
            setActionError({
              title: 'Story changed elsewhere',
              description: error.message,
            })
            return
          }

          const savePresentation = classifyStoryLoadError(error)
          setActionError(savePresentation)
          storyFeedback.cloudSyncFailed(savePresentation.description)
        },
      },
    )
  }

  async function handleGenerateMissingImages() {
    const result = await pageImageGeneration.generateMissingImages()

    if (result.generated.length > 0) {
      storyFeedback.imagesGenerated(result.generated.length)
    }

    if (result.mockFallbackPages.length > 0) {
      storyFeedback.imageGenerationSucceededWithFallback()
    }

    if (result.failed.length > 0) {
      storyFeedback.imageGenerationFailed(
        result.failed
          .map((item) => `Page ${item.pageNumber}: ${item.errorMessage}`)
          .join(' '),
      )
    }
  }

  async function handleRegeneratePageImage(pageNumber: number) {
    const result = await pageImageGeneration.regeneratePageImage(pageNumber)

    if (result.ok) {
      if (result.usedMockFallback) {
        storyFeedback.imageGenerationSucceededWithFallback()
      } else {
        storyFeedback.imagesGenerated(1)
      }
      return
    }

    if (result.errorMessage) {
      storyFeedback.imageGenerationFailed(result.errorMessage)
    }
  }

  function handleSaveImagePrompts() {
    if (!draft || !viewStory || !imagePromptReview.isDirty || isMutating) return

    const updatedStory = imagePromptReview.applyToStory(viewStory)

    void mutation.run(
      () =>
        saveStoryEditorChanges(draft.id, updatedStory, {
          expectedUpdatedAt: draft.updatedAt,
          expectedVersion: draft.version,
        }).then(({ story }) => story),
      {
        optimistic: () => {
          setActionError(null)
          setOptimisticDisplayStory(updatedStory)
        },
        rollback: () => {
          setOptimisticDisplayStory(null)
          storyFeedback.optimisticRollback('Your prompt edits could not be saved.')
        },
        onSuccess: () => {
          setOptimisticDisplayStory(null)
          reload()
          storyFeedback.storyUpdated()
        },
        onError: (error) => {
          if (isStorySaveValidationFailure(error)) {
            setActionError({
              title: 'Fix these issues before saving',
              description: getStorySaveValidationMessages(error.result).join(' '),
            })
            return
          }

          if (isStorySaveConflictError(error)) {
            setActionError({
              title: 'Story changed elsewhere',
              description: error.message,
            })
            return
          }

          const savePresentation = classifyStoryLoadError(error)
          setActionError(savePresentation)
          storyFeedback.cloudSyncFailed(savePresentation.description)
        },
      },
    )
  }

  function handleDuplicateStory() {
    if (!draft || isMutating) return

    void mutation.run(() => duplicateStory(draft.id), {
      optimistic: () => {
        setActionError(null)
      },
      onSuccess: (duplicated) => {
        storyFeedback.storyDuplicated(duplicated.title)
        navigate(`/dashboard/stories/${encodeURIComponent(duplicated.id)}`)
      },
      onError: (error) => {
        const presentation = classifyStoryLoadError(error)
        setActionError(presentation)
        storyFeedback.cloudSyncFailed(presentation.description)
      },
    })
  }

  function handleToggleArchive() {
    if (!draft || isMutating) return

    const isArchived = isStoryArchived(draft)
    if (isArchived) {
      if (!confirmUnarchiveStory(draft.title)) return
    } else if (!confirmArchiveStory(draft.title)) {
      return
    }

    void mutation.run(() => (isArchived ? unarchiveStory(draft.id) : archiveStory(draft.id)), {
      optimistic: () => {
        setActionError(null)
      },
      onSuccess: () => {
        if (isArchived) {
          storyFeedback.storyUnarchived(draft.title)
        } else {
          storyFeedback.storyArchived(draft.title)
          navigate('/dashboard/stories')
        }
        reload()
      },
      onError: (error) => {
        const presentation = classifyStoryLoadError(error)
        setActionError(presentation)
        storyFeedback.cloudSyncFailed(presentation.description)
      },
    })
  }

  function handleToggleAssignPanel() {
    setIsAssignPanelOpen((current) => {
      const next = !current
      if (next) {
        classroomAssignment.resetSelection()
      }
      return next
    })
  }

  async function handleSaveClassroomAssignments() {
    await classroomAssignment.saveAssignments()
    storyFeedback.storyClassroomAssignmentsSaved(classroomAssignment.selectedClassroomIds.length)
    setIsAssignPanelOpen(false)
  }

  const lifecycleStatus = draft ? resolveStoryLifecycleStatus(draft) : null
  const statusLabel = draft ? getStoryProjectStatusLabel(draft) : ''
  const isArchived = draft ? isStoryArchived(draft) : false
  const headerStatusLabel = isArchived ? 'Archived' : statusLabel
  const canMarkComplete =
    isGenerated && lifecycleStatus !== 'completed' && lifecycleStatus !== 'draft' && !isEditing && !isArchived

  const generatedActions: StoryActionConfig[] = [
    {
      key: 'complete',
      hidden: !canMarkComplete,
      onClick: handleMarkComplete,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'duplicate',
      hidden: isEditing,
      onClick: handleDuplicateStory,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'archive',
      hidden: isEditing,
      label: isArchived ? 'Unarchive story' : undefined,
      onClick: handleToggleArchive,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'assignClassroom',
      hidden: isEditing || isArchived,
      onClick: handleToggleAssignPanel,
    },
    {
      key: 'delete',
      hidden: isEditing,
      onClick: handleDeleteStory,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'ai',
      hidden: true,
    },
    {
      key: 'edit',
      hidden: isEditing || isArchived,
      onClick: handleEnterEditMode,
    },
    {
      key: 'advancedEditor',
      hidden: isEditing || isArchived,
      onClick: handleOpenAdvancedEditor,
    },
    {
      key: 'cancel',
      hidden: !isEditing,
      onClick: handleCancelEditing,
      disabled: isMutating,
    },
    {
      key: 'saveAsCopy',
      hidden: !isEditing,
      onClick: handleSaveAsCopy,
      disabled: !hasChanges || isMutating,
      loading: isMutating,
    },
    {
      key: 'save',
      hidden: !isEditing,
      onClick: handleSaveChanges,
      disabled: !hasChanges || isMutating,
      loading: isMutating,
    },
  ]

  const setupOnlyActions: StoryActionConfig[] = [
    {
      key: 'assignClassroom',
      onClick: handleToggleAssignPanel,
    },
    {
      key: 'archive',
      label: isArchived ? 'Unarchive story' : undefined,
      onClick: handleToggleArchive,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'duplicate',
      onClick: handleDuplicateStory,
      loading: isMutating,
      disabled: isMutating,
    },
    {
      key: 'delete',
      onClick: handleDeleteStory,
      loading: isMutating,
      disabled: isMutating,
    },
  ]

  const displayStory =
    optimisticDisplayStory ??
    (isEditing && editedStory ? editedStory : sourceGeneratedStory)

  const pageImageGeneration = useStoryPageImageGeneration({
    story: !isEditing && isGenerated ? displayStory : null,
    storyId: draft?.id ?? storyId ?? '',
  })

  const viewStory =
    !isEditing && pageImageGeneration.story ? pageImageGeneration.story : displayStory

  const hasUnsavedImages =
    !isEditing && displayStory && viewStory
      ? haveStoryPageImagesChanged(viewStory, displayStory)
      : false

  const illustrationReadyCount =
    viewStory?.storyPages.filter((page) =>
      isStoryPageImageReady(page, viewStory.imagePrompts),
    ).length ?? 0

  const illustrationFailedCount =
    viewStory?.storyPages.filter((page) => page.imageStatus === StoryPageImageStatuses.FAILED)
      .length ?? 0

  const imagePromptReview = useImagePromptReview(isEditing ? null : viewStory)
  const pageDescription = isGenerated
    ? isEditing
      ? 'Update story pages, flashcards, or illustration notes, then save your changes.'
      : isArchived
        ? 'This story is archived — unarchive it to assign, edit, or read aloud again.'
        : 'Review your story — Quick edit for small changes, Advanced editor for structure and version history.'
    : 'This is your saved story plan. Open the story creator to generate pages for your class.'

  return (
    <StoryDetailLoadGuard
      status={status}
      presentation={presentation}
      isAuthLoading={isAuthLoading}
    >
      {draft && (!isGenerated || displayStory) && (
        <>
          <PageHeader
            title={draft.title}
            description={pageDescription}
            actions={
              <StoryDetailNav
                onBack={handleBackToStories}
                onViewStory={isGenerated && isEditing ? handleViewStory : undefined}
                onContinueEditing={handleContinueEditing}
                onOpenAdvancedEditor={isGenerated && !isEditing && !isArchived ? handleOpenAdvancedEditor : undefined}
                onReadStory={isGenerated && !isEditing && !isArchived ? handleReadStory : undefined}
                onRoleplay={isGenerated && !isEditing && !isArchived ? handleOpenRoleplay : undefined}
                isSetupOnly={!isGenerated}
                continueEditingActive={isEditing}
              />
            }
          />

          <div className={dashboardPageStackClass}>
            {isGenerated && (
              <div className="space-y-4">
                <StoryDetailModeBanner isEditing={isEditing} isDirty={hasChanges} />
                <StoryActionsBar actions={generatedActions} />
              </div>
            )}

            {!isGenerated && <StoryActionsBar actions={setupOnlyActions} />}

            {actionError && (
              <ErrorState title={actionError.title} description={actionError.description}>
                <div className="flex flex-wrap gap-2">
                  {actionError.title === 'Story changed elsewhere' ? (
                    <AppButton type="button" variant="secondary" onClick={() => reload()}>
                      Reload story
                    </AppButton>
                  ) : null}
                  <AppButton type="button" variant="secondary" onClick={() => setActionError(null)}>
                    Dismiss
                  </AppButton>
                </div>
              </ErrorState>
            )}

            <StoryHeader
              title={draft.title}
              statusLabel={headerStatusLabel}
              summary={isGenerated && displayStory ? displayStory.summary : undefined}
              pageCount={
                isGenerated && displayStory
                  ? displayStory.storyPages.length
                  : draft.pageCount
              }
              totalWordCount={isGenerated && displayStory ? displayStory.totalWordCount : 0}
              versionBadge={isGenerated ? formatStoryVersionBadge(draft.version) : null}
              updatedAtLabel={formatStoryDate(draft.updatedAt)}
              hideReadOnlyBadge={!isGenerated || isEditing || isArchived}
            />

            <StoryMetadata
              createdAtLabel={formatStoryDate(draft.createdAt)}
              updatedAtLabel={formatStoryDate(draft.updatedAt)}
              theme={draft.theme}
              pageCount={draft.pageCount}
              setupSections={
                draft.setup ? mapStorySetupReviewSections(draft.setup) : undefined
              }
              setupFields={
                draft.setup ? undefined : buildStoryDetailFallbackFields(draft)
              }
            />

            {!isEditing ? (
              <>
                <StoryClassroomsSection
                  assignedClassrooms={classroomAssignment.assignedClassrooms}
                  isLoading={classroomAssignment.isLoading}
                />
                {isAssignPanelOpen ? (
                  <AssignStoryToClassroomPanel
                    classrooms={classroomAssignment.classrooms}
                    selectedClassroomIds={classroomAssignment.selectedClassroomIds}
                    isLoading={classroomAssignment.isLoading}
                    isSaving={classroomAssignment.isSaving}
                    isDirty={classroomAssignment.isDirty}
                    onToggleClassroom={classroomAssignment.toggleClassroom}
                    onSave={() => void handleSaveClassroomAssignments()}
                    onCancel={() => {
                      classroomAssignment.resetSelection()
                      setIsAssignPanelOpen(false)
                    }}
                  />
                ) : null}
              </>
            ) : null}

            {isGenerated && isEditing && editedStory ? (
              <div className={`${panelShellClass} border-2 border-amber-200 p-2 shadow-sm sm:p-4`}>
                <StoryEditForm
                  story={editedStory}
                  onPageTextChange={updatePageText}
                  onFlashcardChange={updateFlashcard}
                  onImagePromptChange={updateImagePrompt}
                />
              </div>
            ) : isGenerated && viewStory ? (
              <div id="story-detail-content">
                <StoryGeneratedContentSections>
                  <ImagePromptReviewPanel
                    pages={viewStory.storyPages}
                    prompts={imagePromptReview.prompts}
                    originalPrompts={imagePromptReview.baseline}
                    onPromptChange={imagePromptReview.updatePrompt}
                    onResetPage={imagePromptReview.resetPage}
                    onResetAll={imagePromptReview.resetAll}
                    isPageModified={imagePromptReview.isPageModified}
                    isDirty={imagePromptReview.isDirty}
                    onSave={handleSaveImagePrompts}
                    isSaving={isMutating}
                  />
                  <StoryImageGenerationPanel
                    missingCount={pageImageGeneration.missingCount}
                    isGenerating={pageImageGeneration.isGenerating}
                    lastError={pageImageGeneration.lastError}
                    onGenerateMissing={() => void handleGenerateMissingImages()}
                    onSave={handleSaveIllustrations}
                    canSave={hasUnsavedImages}
                    isSaving={isMutating}
                    readyCount={illustrationReadyCount}
                    failedCount={illustrationFailedCount}
                    totalPages={viewStory.storyPages.length}
                  />
                  <StoryPages
                    pages={viewStory.storyPages}
                    imagePrompts={viewStory.imagePrompts}
                    showImageActions
                    isPageGenerating={pageImageGeneration.isPageGenerating}
                    onRegeneratePageImage={(pageNumber) =>
                      void handleRegeneratePageImage(pageNumber)
                    }
                  />
                  <StoryFlashcards flashcards={viewStory.flashcards} />
                  <StoryExportActions
                    story={viewStory}
                    projectTitle={draft.title}
                    storyId={draft.id}
                  />
                </StoryGeneratedContentSections>
              </div>
            ) : (
              <AppEmptyState
                kind="story-not-generated"
                layout="section"
                title="Story pages not generated yet"
                description="Open the story creator to generate pages, vocabulary cards, and illustration notes."
                actionLabel="Open creator"
                onAction={handleContinueInCreator}
              />
            )}
          </div>
        </>
      )}
    </StoryDetailLoadGuard>
  )
}
