import { useCallback, useEffect, useState } from 'react'
import { listClassrooms } from '../api'
import { classifyClassroomLoadError } from '../lib/classroomRouteGuards'
import type { Classroom, ClassroomLoadErrorPresentation } from '../types'

export interface UseClassroomListResult {
  classrooms: Classroom[]
  isLoading: boolean
  error: ClassroomLoadErrorPresentation | null
  reload: () => void
}

/** Load classrooms for the library page — page → hook → placeholder API. */
export function useClassroomList(): UseClassroomListResult {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ClassroomLoadErrorPresentation | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    void (async () => {
      try {
        const result = await listClassrooms()
        if (cancelled) return
        setClassrooms(result)
      } catch (loadError) {
        if (cancelled) return
        setClassrooms([])
        setError(classifyClassroomLoadError(loadError))
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [reloadVersion])

  return { classrooms, isLoading, error, reload }
}
