import { isCloudStorageFeatureEnabled } from '@/shared/lib/supabase/cloudStorageEligibility'
import { getSupabaseClient } from '@/shared/lib/supabase/supabaseClient'
import type { TeacherTemplateStore } from '../types/teacherTemplate.types'
import { createCloudTeacherTemplateStore, localTeacherTemplateStore } from './localTeacherTemplateStore'

let activeStore: TeacherTemplateStore = localTeacherTemplateStore

export function getTeacherTemplateStore(): TeacherTemplateStore {
  return activeStore
}

/** Test hook — swap template persistence without touching story adapters. */
export function setTeacherTemplateStore(store: TeacherTemplateStore): void {
  activeStore = store
}

export async function resolveTeacherTemplateStore(): Promise<TeacherTemplateStore> {
  if (!isCloudStorageFeatureEnabled()) {
    activeStore = localTeacherTemplateStore
    return activeStore
  }

  try {
    const supabase = getSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user?.id) {
      activeStore = createCloudTeacherTemplateStore(session.user.id)
      return activeStore
    }
  } catch {
    // Fall back to local template storage.
  }

  activeStore = localTeacherTemplateStore
  return activeStore
}

export { localTeacherTemplateStore }
