import type { StoryProject } from '../../types/story-generator.types'
import { localStoryStorageAdapter } from '../storage/localStoryStorageAdapter'
import {
  getLocalCloudMigrationEntry,
  setLocalCloudMigrationEntry,
  syncSessionCloudIdMapping,
} from './localStoryMigrationMap'

export interface LocalStoryMigrationFailure {
  localId: string
  title: string
  error: string
}

export interface LocalStoryMigrationCopyResult {
  copied: number
  skipped: number
  failed: LocalStoryMigrationFailure[]
}

/**
 * Copy local stories into the signed-in cloud account.
 * Reads local adapter directly; writes via supabase adapter directly (not story-storage resolver).
 * Local stories are never deleted.
 */
export async function copyLocalStoriesToCloud(
  stories?: StoryProject[],
): Promise<LocalStoryMigrationCopyResult> {
  const { supabaseStoryStorageAdapter } = await import('../storage/supabaseStoryStorageAdapter')
  const localStories = stories ?? localStoryStorageAdapter.getStoryDrafts()

  const result: LocalStoryMigrationCopyResult = {
    copied: 0,
    skipped: 0,
    failed: [],
  }

  for (const story of localStories) {
    const existing = getLocalCloudMigrationEntry(story.id)
    if (existing) {
      syncSessionCloudIdMapping(story.id, existing.cloudId)
      result.skipped += 1
      continue
    }

    try {
      const saved = await supabaseStoryStorageAdapter.saveStoryDraft(story)
      setLocalCloudMigrationEntry(story.id, saved.id)
      result.copied += 1
    } catch (error) {
      result.failed.push({
        localId: story.id,
        title: story.title?.trim() || 'Untitled story',
        error: error instanceof Error ? error.message : 'Could not copy story',
      })
    }
  }

  return result
}
