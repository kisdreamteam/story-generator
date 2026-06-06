import { isCloudStorageFeatureEnabled } from '@/shared/lib/supabase/cloudStorageEligibility'
import { getSupabaseClient } from '@/shared/lib/supabase/supabaseClient'
import type { StoryHistoryStore } from '../types/storyHistory.types'
import { createCloudStoryHistoryStore, localStoryHistoryStore } from './localStoryHistoryStore'

let activeStore: StoryHistoryStore = localStoryHistoryStore

export function getStoryHistoryStore(): StoryHistoryStore {
  return activeStore
}

/** Test hook — swap history persistence without touching story adapters. */
export function setStoryHistoryStore(store: StoryHistoryStore): void {
  activeStore = store
}

export async function resolveStoryHistoryStore(): Promise<StoryHistoryStore> {
  if (!isCloudStorageFeatureEnabled()) {
    activeStore = localStoryHistoryStore
    return activeStore
  }

  try {
    const supabase = getSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user?.id) {
      activeStore = createCloudStoryHistoryStore(session.user.id)
      return activeStore
    }
  } catch {
    // Fall back to local history storage.
  }

  activeStore = localStoryHistoryStore
  return activeStore
}

export { localStoryHistoryStore }
