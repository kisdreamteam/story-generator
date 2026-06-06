import { isSupabaseStoriesEnabled } from '@/features/story-generator/lib/storage/resolveStoryStorageAdapter'
import { isSupabaseConfigured } from './supabaseClient'

/** True when cloud story storage may activate (still requires signed-in session). */
export function isCloudStorageFeatureEnabled(): boolean {
  return isSupabaseStoriesEnabled() && isSupabaseConfigured()
}
