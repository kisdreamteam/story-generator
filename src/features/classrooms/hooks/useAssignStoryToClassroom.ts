import { useCallback, useEffect, useMemo, useState } from 'react'
import { getClassrooms } from '../api/classroomsApi'
import {
  listClassroomIdsForStory,
  setStoryClassroomAssignments,
} from '../api/storyClassroomAssignmentsApi'
import type { Classroom } from '../types'

function haveSameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false

  const leftSet = new Set(left)
  return right.every((value) => leftSet.has(value))
}

export interface UseAssignStoryToClassroomResult {
  classrooms: Classroom[]
  assignedClassrooms: Classroom[]
  selectedClassroomIds: string[]
  isLoading: boolean
  isSaving: boolean
  isDirty: boolean
  toggleClassroom: (classroomId: string) => void
  resetSelection: () => void
  saveAssignments: () => Promise<void>
  reload: () => Promise<void>
}

/** Manage classroom assignment selection for one story. */
export function useAssignStoryToClassroom(
  storyId: string | undefined,
): UseAssignStoryToClassroomResult {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignedClassroomIds, setAssignedClassroomIds] = useState<string[]>([])
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const reload = useCallback(async () => {
    if (!storyId) {
      setClassrooms([])
      setAssignedClassroomIds([])
      setSelectedClassroomIds([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const [allClassrooms, assignedIds] = await Promise.all([
        getClassrooms(),
        listClassroomIdsForStory(storyId),
      ])

      setClassrooms(allClassrooms)
      setAssignedClassroomIds(assignedIds)
      setSelectedClassroomIds(assignedIds)
    } finally {
      setIsLoading(false)
    }
  }, [storyId])

  useEffect(() => {
    void reload()
  }, [reload])

  const assignedClassrooms = useMemo(
    () => classrooms.filter((classroom) => assignedClassroomIds.includes(classroom.id)),
    [assignedClassroomIds, classrooms],
  )

  const isDirty = useMemo(
    () => !haveSameMembers(selectedClassroomIds, assignedClassroomIds),
    [assignedClassroomIds, selectedClassroomIds],
  )

  const toggleClassroom = useCallback((classroomId: string) => {
    setSelectedClassroomIds((current) =>
      current.includes(classroomId)
        ? current.filter((value) => value !== classroomId)
        : [...current, classroomId],
    )
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedClassroomIds(assignedClassroomIds)
  }, [assignedClassroomIds])

  const saveAssignments = useCallback(async () => {
    if (!storyId || isSaving) return

    setIsSaving(true)

    try {
      await setStoryClassroomAssignments(storyId, selectedClassroomIds)
      await reload()
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, reload, selectedClassroomIds, storyId])

  return {
    classrooms,
    assignedClassrooms,
    selectedClassroomIds,
    isLoading,
    isSaving,
    isDirty,
    toggleClassroom,
    resetSelection,
    saveAssignments,
    reload,
  }
}
