import { DEFAULT_LANGUAGE } from '@/features/story-projects/config/formOptions'
import type { Classroom, CreateClassroomInput } from '../types'

interface LegacyClassroomRecord {
  id?: unknown
  name?: unknown
  ageRange?: unknown
  gradeLevel?: unknown
  language?: unknown
  description?: unknown
  storyCount?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function createClassroomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `classroom-${crypto.randomUUID()}`
  }

  return `classroom-${Date.now()}`
}

/** Normalize stored or in-memory values into the current classroom model. */
export function normalizeClassroom(value: unknown): Classroom | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as LegacyClassroomRecord
  const id = readString(record.id)
  const name = readString(record.name)

  if (!id || !name) {
    return null
  }

  const ageRange = readString(record.ageRange) || readString(record.gradeLevel) || '4-6'
  const language = readString(record.language) || DEFAULT_LANGUAGE
  const now = new Date().toISOString()

  return {
    id,
    name,
    ageRange,
    language,
    createdAt: readString(record.createdAt) || now,
    updatedAt: readString(record.updatedAt) || now,
  }
}

export function isClassroom(value: unknown): value is Classroom {
  return normalizeClassroom(value) !== null
}

export function buildClassroomFromInput(input: CreateClassroomInput): Classroom {
  const now = new Date().toISOString()

  return {
    id: input.id?.trim() || createClassroomId(),
    name: input.name.trim(),
    ageRange: input.ageRange.trim() || '4-6',
    language: input.language.trim() || DEFAULT_LANGUAGE,
    createdAt: now,
    updatedAt: now,
  }
}

export function mergeClassroomUpdate(
  existing: Classroom,
  updates: Partial<Omit<Classroom, 'id' | 'createdAt'>>,
): Classroom {
  const now = new Date().toISOString()

  return {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    name: updates.name?.trim() || existing.name,
    ageRange: updates.ageRange?.trim() || existing.ageRange,
    language: updates.language?.trim() || existing.language,
    updatedAt: now,
  }
}
