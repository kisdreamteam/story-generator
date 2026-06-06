import { deleteStoryImageGenerationRecord } from '@/shared/ai/images'
import {
  deleteStoryDraft,
  getStoryDraft,
  loadDraftWithGeneratedStory,
  saveStoryDraft,
  updateStory,
} from '@/features/story-generator'
import type { GeneratedStory, StoryProject } from '@/features/stories/types'
import {
  StorySaveValidationFailure,
  StorySaveValidationCode,
  toSafeSaveStoryFailure,
  validateStoryForSave,
  type SafeSaveStoryResult,
  type ValidateStoryForSaveOptions,
} from '@/features/stories/utils/storyValidation'
import { buildDuplicatedStoryPlanProject, buildDuplicatedStoryProject } from '../utils/duplicateStoryProject'
import {
  appendStoryHistorySnapshotBeforeSave,
  deleteStoryHistory,
} from '@/features/story-history'

export type { LoadDraftWithGeneratedStoryResult } from '@/features/story-generator/lib/storage/StoryStorageAdapter'
export type { ValidateStoryForSaveOptions } from '@/features/stories/utils/storyValidation'

export type StoryDetailData =
  | { kind: 'generated'; draft: StoryProject; generatedStory: GeneratedStory }
  | { kind: 'setup-only'; draft: StoryProject }

/** Load a story with generated content via the storage adapter resolver. */
export async function fetchStoryWithGeneratedContent(id: string) {
  return loadDraftWithGeneratedStory(id)
}

/**
 * Load a story for the detail route — generated content when available,
 * otherwise the setup-only draft shell.
 */
export async function fetchStoryForDetail(id: string): Promise<StoryDetailData | null> {
  const withGenerated = await loadDraftWithGeneratedStory(id)
  if (withGenerated) {
    return { kind: 'generated', ...withGenerated }
  }

  const draft = await getStoryDraft(id)
  if (!draft) return null

  return { kind: 'setup-only', draft }
}

/** Persist edited generated story content without overwriting setup or createdAt. Increments version and updatedAt. */
export async function persistStoryEdits(id: string, generatedStory: GeneratedStory) {
  return updateStory(id, generatedStory)
}

/** Validate then persist — blocks save when story content fails pre-save checks. */
export async function persistValidatedStoryEdits(
  id: string,
  generatedStory: GeneratedStory,
  options?: ValidateStoryForSaveOptions,
) {
  const validation = validateStoryForSave(generatedStory, options)
  if (!validation.isValid) {
    throw new StorySaveValidationFailure(validation)
  }

  await appendStoryHistorySnapshotBeforeSave(id)

  return persistStoryEdits(id, generatedStory)
}

function toSaveFailedResult(message: string): Extract<SafeSaveStoryResult, { ok: false }> {
  return toSafeSaveStoryFailure({
    errors: [
      {
        code: StorySaveValidationCode.SAVE_FAILED,
        message,
      },
    ],
    errorCount: 1,
    isValid: false,
  })
}

/**
 * Validate then persist — returns a result instead of throwing on validation or storage errors.
 */
export async function safeSaveStory(
  id: string,
  generatedStory: GeneratedStory,
  options?: ValidateStoryForSaveOptions,
): Promise<SafeSaveStoryResult> {
  if (!id?.trim()) {
    return toSaveFailedResult('Cannot save without a story id.')
  }

  const validation = validateStoryForSave(generatedStory, options)
  if (!validation.isValid) {
    return toSafeSaveStoryFailure(validation)
  }

  try {
    const project = await persistValidatedStoryEdits(id, generatedStory, options)
    if (!project) {
      return toSaveFailedResult('Story could not be saved. Try again.')
    }

    return { ok: true, project }
  } catch (error) {
    if (error instanceof StorySaveValidationFailure) {
      return toSafeSaveStoryFailure(error.result)
    }

    return toSaveFailedResult(
      error instanceof Error ? error.message : 'Story could not be saved. Try again.',
    )
  }
}

/** Duplicate a saved story or plan as a new editable project via the storage adapter. */
export async function duplicateStory(sourceId: string): Promise<StoryProject> {
  const withGenerated = await loadDraftWithGeneratedStory(sourceId)
  if (withGenerated) {
    const duplicated = buildDuplicatedStoryProject(withGenerated.draft, withGenerated.generatedStory)
    return saveStoryDraft(duplicated)
  }

  const draft = await getStoryDraft(sourceId)
  if (!draft) {
    throw new Error(`Story not found: ${sourceId}`)
  }

  const duplicated = buildDuplicatedStoryPlanProject(draft)
  return saveStoryDraft(duplicated)
}

/** Delete a story via the active storage adapter (local or cloud). */
export async function deleteStory(id: string): Promise<void> {
  if (!id) {
    throw new Error('Cannot delete story without an id.')
  }

  await deleteStoryDraft(id)
  await deleteStoryHistory(id)
  deleteStoryImageGenerationRecord(id)
}
