import type { Classroom, CreateClassroomInput } from '../types'
import {
  clearClassrooms,
  createClassroom,
  deleteClassroom,
  getClassroom,
  getClassrooms,
  saveClassroom,
} from '../lib/classroom-storage'

export type { CreateClassroomInput }

/** Feature API — list classrooms for the library page. */
export async function listClassrooms(): Promise<Classroom[]> {
  return getClassrooms()
}

/** Feature API — load one classroom for the detail route. */
export async function getClassroomById(classroomId: string): Promise<Classroom | null> {
  return getClassroom(classroomId)
}

export {
  clearClassrooms,
  createClassroom,
  deleteClassroom,
  getClassroom,
  getClassrooms,
  saveClassroom,
}
