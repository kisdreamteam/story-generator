import type { Classroom } from '../types'

/** Persistence boundary — localStorage today, Supabase later (sync). */
export interface ClassroomStorageAdapter {
  getClassroom(id: string): Classroom | null
  getClassrooms(): Classroom[]
  saveClassroom(classroom: Classroom): void
  deleteClassroom(id: string): void
  clearClassrooms(): void
}

/** Async variant for future cloud adapters — same methods, Promise-based. */
export interface ClassroomStorageAdapterAsync {
  getClassroom(id: string): Promise<Classroom | null>
  getClassrooms(): Promise<Classroom[]>
  saveClassroom(classroom: Classroom): Promise<Classroom>
  deleteClassroom(id: string): Promise<void>
  clearClassrooms(): Promise<void>
}
