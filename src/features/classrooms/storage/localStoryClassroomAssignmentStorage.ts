import type { StoryClassroomAssignment } from '../types/storyClassroomAssignment.types'

export const STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY = 'story-generator:story-classroom-assignments'

function isStoryClassroomAssignment(value: unknown): value is StoryClassroomAssignment {
  if (!value || typeof value !== 'object') return false

  const record = value as Partial<StoryClassroomAssignment>
  return (
    typeof record.storyId === 'string' &&
    record.storyId.trim().length > 0 &&
    typeof record.classroomId === 'string' &&
    record.classroomId.trim().length > 0 &&
    typeof record.assignedAt === 'string'
  )
}

function readAssignments(): StoryClassroomAssignment[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoryClassroomAssignment)
  } catch {
    return []
  }
}

function writeAssignments(assignments: StoryClassroomAssignment[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments))
  } catch {
    // Ignore write failures.
  }
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
}

export const localStoryClassroomAssignmentStorage = {
  listClassroomIdsForStory(storyId: string): string[] {
    if (!storyId.trim()) return []

    return readAssignments()
      .filter((assignment) => assignment.storyId === storyId)
      .map((assignment) => assignment.classroomId)
  },

  listStoryIdsForClassroom(classroomId: string): string[] {
    if (!classroomId.trim()) return []

    return readAssignments()
      .filter((assignment) => assignment.classroomId === classroomId)
      .map((assignment) => assignment.storyId)
  },

  setStoryClassroomAssignments(storyId: string, classroomIds: string[]): void {
    if (!storyId.trim()) return

    const now = new Date().toISOString()
    const nextIds = uniqueIds(classroomIds)
    const remaining = readAssignments().filter((assignment) => assignment.storyId !== storyId)
    const next = [
      ...remaining,
      ...nextIds.map((classroomId) => ({
        storyId,
        classroomId,
        assignedAt: now,
      })),
    ]

    writeAssignments(next)
  },

  removeAssignmentsForStory(storyId: string): void {
    if (!storyId.trim()) return

    writeAssignments(readAssignments().filter((assignment) => assignment.storyId !== storyId))
  },

  removeAssignmentsForClassroom(classroomId: string): void {
    if (!classroomId.trim()) return

    writeAssignments(
      readAssignments().filter((assignment) => assignment.classroomId !== classroomId),
    )
  },

  unassignStoryFromClassroom(storyId: string, classroomId: string): void {
    if (!storyId.trim() || !classroomId.trim()) return

    writeAssignments(
      readAssignments().filter(
        (assignment) =>
          !(assignment.storyId === storyId && assignment.classroomId === classroomId),
      ),
    )
  },

  clearAssignments(): void {
    try {
      if (typeof localStorage === 'undefined') return

      localStorage.removeItem(STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY)
    } catch {
      // Fail safely.
    }
  },
}
