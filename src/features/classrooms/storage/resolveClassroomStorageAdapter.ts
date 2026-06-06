import type { ClassroomStorageAdapterAsync } from './ClassroomStorageAdapter'
import { localClassroomStorageAdapterAsync } from './localClassroomStorageAdapter'

/** Resolve the active classroom storage adapter. Local-only until cloud classrooms ship. */
export async function resolveClassroomStorageAdapter(): Promise<ClassroomStorageAdapterAsync> {
  return localClassroomStorageAdapterAsync
}
