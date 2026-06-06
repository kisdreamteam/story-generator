import type { Classroom } from '../types'
import { normalizeClassroom } from './normalizeClassroom'
import type { ClassroomStorageAdapter, ClassroomStorageAdapterAsync } from './ClassroomStorageAdapter'

export const CLASSROOMS_STORAGE_KEY = 'story-generator:classrooms'

function readClassrooms(): Classroom[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(CLASSROOMS_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((value) => normalizeClassroom(value))
      .filter((value): value is Classroom => value !== null)
  } catch {
    return []
  }
}

function writeClassrooms(classrooms: Classroom[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(CLASSROOMS_STORAGE_KEY, JSON.stringify(classrooms))
  } catch {
    // Ignore write failures (private mode, quota, etc.).
  }
}

export const localClassroomStorageAdapter: ClassroomStorageAdapter = {
  getClassrooms(): Classroom[] {
    return readClassrooms().sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
  },

  getClassroom(id: string): Classroom | null {
    try {
      if (!id) return null

      return readClassrooms().find((classroom) => classroom.id === id) ?? null
    } catch {
      return null
    }
  },

  saveClassroom(classroom: Classroom): void {
    try {
      const normalized = normalizeClassroom(classroom)
      if (!normalized) return

      const classrooms = readClassrooms()
      const now = new Date().toISOString()
      const existing = classrooms.find((item) => item.id === normalized.id)
      const next: Classroom = {
        ...normalized,
        createdAt: existing?.createdAt ?? normalized.createdAt ?? now,
        updatedAt: now,
      }

      const existingIndex = classrooms.findIndex((item) => item.id === next.id)
      if (existingIndex >= 0) {
        classrooms[existingIndex] = next
      } else {
        classrooms.push(next)
      }

      writeClassrooms(classrooms)
    } catch {
      // Fail safely — caller can treat save as best-effort.
    }
  },

  deleteClassroom(id: string): void {
    if (!id) {
      throw new Error('Cannot delete classroom without an id.')
    }

    const classrooms = readClassrooms()
    const exists = classrooms.some((classroom) => classroom.id === id)
    if (!exists) {
      throw new Error(`Classroom not found: ${id}`)
    }

    writeClassrooms(classrooms.filter((classroom) => classroom.id !== id))
  },

  clearClassrooms(): void {
    try {
      if (typeof localStorage === 'undefined') return

      localStorage.removeItem(CLASSROOMS_STORAGE_KEY)
    } catch {
      // Fail safely.
    }
  },
}

/** Async wrapper around the sync local adapter for the public storage boundary. */
export const localClassroomStorageAdapterAsync: ClassroomStorageAdapterAsync = {
  getClassrooms: () => Promise.resolve(localClassroomStorageAdapter.getClassrooms()),
  getClassroom: (id) => Promise.resolve(localClassroomStorageAdapter.getClassroom(id)),
  saveClassroom: async (classroom) => {
    localClassroomStorageAdapter.saveClassroom(classroom)
    return localClassroomStorageAdapter.getClassroom(classroom.id) ?? classroom
  },
  deleteClassroom: (id) => Promise.resolve(localClassroomStorageAdapter.deleteClassroom(id)),
  clearClassrooms: () => Promise.resolve(localClassroomStorageAdapter.clearClassrooms()),
}
