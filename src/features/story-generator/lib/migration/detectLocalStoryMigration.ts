import type { StoryProject } from '../../types/story-generator.types'
import { localStoryStorageAdapter } from '../storage/localStoryStorageAdapter'
import { getLocalCloudMigrationEntry } from './localStoryMigrationMap'
import { buildPendingStoriesFingerprint } from './localStoryMigrationDismissal'

export interface LocalStoryMigrationDetection {
  eligible: boolean
  pendingStories: StoryProject[]
  pendingCount: number
  fingerprint: string
}

function storyContentKey(story: StoryProject): string {
  const title = story.title?.trim() || 'Untitled story'
  return `${title}::${story.createdAt}`
}

function isLikelyCloudDuplicate(local: StoryProject, cloudStories: StoryProject[]): boolean {
  const key = storyContentKey(local)
  return cloudStories.some((cloud) => storyContentKey(cloud) === key)
}

function isAlreadyMigratedLocally(localId: string): boolean {
  return Boolean(getLocalCloudMigrationEntry(localId))
}

/**
 * Detect local stories that can be copied to the signed-in cloud account.
 * Reads local adapter directly; optionally compares against cloud list for duplicate protection.
 */
export async function detectPendingLocalStoryMigration(options: {
  cloudStorageActive: boolean
}): Promise<LocalStoryMigrationDetection> {
  const empty: LocalStoryMigrationDetection = {
    eligible: false,
    pendingStories: [],
    pendingCount: 0,
    fingerprint: '',
  }

  if (!options.cloudStorageActive) {
    return empty
  }

  const localStories = localStoryStorageAdapter.getStoryDrafts()
  if (localStories.length === 0) {
    return empty
  }

  let cloudStories: StoryProject[] = []

  try {
    const { supabaseStoryStorageAdapter } = await import('../storage/supabaseStoryStorageAdapter')
    cloudStories = await supabaseStoryStorageAdapter.getStoryDrafts()
  } catch {
    // Cloud list unavailable — still offer migration for unmapped local stories.
  }

  const pendingStories = localStories.filter((story) => {
    if (isAlreadyMigratedLocally(story.id)) return false
    if (isLikelyCloudDuplicate(story, cloudStories)) return false
    return true
  })

  const fingerprint = buildPendingStoriesFingerprint(pendingStories.map((story) => story.id))

  return {
    eligible: pendingStories.length > 0,
    pendingStories,
    pendingCount: pendingStories.length,
    fingerprint,
  }
}
