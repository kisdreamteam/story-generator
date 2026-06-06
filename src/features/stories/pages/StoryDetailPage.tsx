import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppButton, ErrorState, PageHeader } from '@/shared/components'
import {
  classifyStoryDeleteError,
  classifyStoryLoadError,
  type StoryLoadErrorPresentation,
} from '@/features/story-generator/lib/story-route-guards'
import {
  getStorySaveValidationMessages,
  isStorySaveValidationFailure,
} from '@/features/stories/utils/storyValidation'
import { storyFeedback } from '@/shared/feedback'
import { useAsyncMutation } from '@/shared/lib/mutations'
import { StoryEditForm, withRecalculatedWordCounts, type GeneratedStory } from '@/features/stories'
import { deleteStory, duplicateStory, persistValidatedStoryEdits } from '../api/storyStorageApi'
import { confirmDeleteStory } from '../lib/confirmDeleteStory'
import { StoryActionsBar, type StoryActionConfig } from '../components/StoryActionsBar'
import {
  StoryDetailModeBanner,
  StoryDetailNav,
  StoryFlashcards,
  StoryGeneratedContentSections,
  StoryHeader,
  StoryImagePrompts,
  StoryMetadata,
  StoryPages,
} from '../components/story-detail'
import { StoryDetailLoadGuard } from '../components/StoryDetailLoadGuard'
import { useStoryDetail } from '../hooks/useStoryDetail'
import { useStoryEditor, useStoryDirtyState } from '@/features/story-editor'
import { formatStoryDate } from '../utils/storyFormat'
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
  const [optimisticDisplayStory, setOptimisticDisplayStory] = useState<GeneratedStory | null>(null)
  const [actionError, setActionError] = useState<StoryLoadErrorPresentation | null>(null)
  const mutation = useAsyncMutation()
  const isMutating = mutation.isPending

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

  function handleEnterEditMode() {
    setActionError(null)
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

    const normalizedStory = withRecalculatedWordCounts(editedStory)

    void mutation.run(() => persistValidatedStoryEdits(draft.id, normalizedStory), {
      optimistic: () => {
        setActionError(null)
        setOptimisticDisplayStory(normalizedStory)
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

  const generatedActions: StoryActionConfig[] = [
    {
      key: 'duplicate',
      hidden: isEditing,
      onClick: handleDuplicateStory,
      loading: isMutating,
      disabled: isMutating,
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
      hidden: isEditing,
      comingSoon: true,
      disabled: true,
    },
    {
      key: 'edit',
      hidden: isEditing,
      onClick: handleEnterEditMode,
    },
    {
      key: 'cancel',
      hidden: !isEditing,
      onClick: handleCancelEditing,
      disabled: isMutating,
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
  const statusLabel = draft ? getStoryProjectStatusLabel(draft) : ''
  const pageDescription = isGenerated
    ? isEditing
      ? 'Update story pages, flashcards, or illustration notes, then save your changes.'
      : 'Your saved classroom story — read it here or open it in the creator to adjust your plan.'
    : 'This is your saved story plan. Open the creator to generate your classroom story.'

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
                onContinueInCreator={handleContinueInCreator}
                continueLabel={isGenerated ? 'Open in creator' : 'Continue editing'}
              />
            }
          />

          <div className="mx-auto max-w-2xl space-y-8 px-1 sm:px-0">
            {isGenerated && (
              <div className="space-y-4">
                <StoryDetailModeBanner isEditing={isEditing} isDirty={hasChanges} />
                <StoryActionsBar actions={generatedActions} />
              </div>
            )}

            {!isGenerated && <StoryActionsBar actions={setupOnlyActions} />}

            {actionError && (
              <ErrorState title={actionError.title} description={actionError.description}>
                <AppButton type="button" variant="secondary" onClick={() => setActionError(null)}>
                  Dismiss
                </AppButton>
              </ErrorState>
            )}

            <StoryHeader
              title={draft.title}
              statusLabel={statusLabel}
              summary={isGenerated && displayStory ? displayStory.summary : undefined}
              pageCount={
                isGenerated && displayStory
                  ? displayStory.storyPages.length
                  : draft.pageCount
              }
              totalWordCount={isGenerated && displayStory ? displayStory.totalWordCount : 0}
              hideReadOnlyBadge={!isGenerated || isEditing}
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

            {isGenerated && isEditing && editedStory ? (
              <div className="rounded-xl border-2 border-amber-200 bg-white p-2 sm:p-4">
                <StoryEditForm
                  story={editedStory}
                  onPageTextChange={updatePageText}
                  onFlashcardChange={updateFlashcard}
                  onImagePromptChange={updateImagePrompt}
                />
              </div>
            ) : isGenerated && displayStory ? (
              <StoryGeneratedContentSections>
                <StoryPages pages={displayStory.storyPages} />
                <StoryFlashcards flashcards={displayStory.flashcards} />
                <StoryImagePrompts imagePrompts={displayStory.imagePrompts} />
              </StoryGeneratedContentSections>
            ) : (
              <StoryGeneratedContentSections>
                <StoryPages pages={[]} />
                <StoryFlashcards flashcards={[]} />
                <StoryImagePrompts imagePrompts={[]} />
              </StoryGeneratedContentSections>
            )}
          </div>
        </>
      )}
    </StoryDetailLoadGuard>
  )
}
