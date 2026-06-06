import type { Classroom, CreateClassroomInput } from '../types'
import {
  buildClassroomFromInput,
  resolveClassroomStorageAdapter,
} from '../storage'
import { removeClassroomStoryAssignments } from './storyClassroomAssignments'

export { CLASSROOMS_STORAGE_KEY } from '../storage'

/** List classrooms through the active storage adapter. */
export async function getClassrooms(): Promise<Classroom[]> {
  const adapter = await resolveClassroomStorageAdapter()
  return adapter.getClassrooms()
}

/** Load one classroom by id through the active storage adapter. */
export async function getClassroom(id: string): Promise<Classroom | null> {
  const adapter = await resolveClassroomStorageAdapter()
  return adapter.getClassroom(id)
}

/** Persist a classroom record. Creates or updates by id. */
export async function saveClassroom(classroom: Classroom): Promise<Classroom> {
  const adapter = await resolveClassroomStorageAdapter()
  return adapter.saveClassroom(classroom)
}

/** Create and persist a new classroom from teacher input. */
export async function createClassroom(input: CreateClassroomInput): Promise<Classroom> {
  return saveClassroom(buildClassroomFromInput(input))
}

/** Delete a classroom by id. */
export async function deleteClassroom(id: string): Promise<void> {
  const adapter = await resolveClassroomStorageAdapter()
  await adapter.deleteClassroom(id)
  await removeClassroomStoryAssignments(id)
}

/** Clear all locally stored classrooms — intended for tests and dev reset flows. */
export async function clearClassrooms(): Promise<void> {
  const adapter = await resolveClassroomStorageAdapter()
  await adapter.clearClassrooms()
}
