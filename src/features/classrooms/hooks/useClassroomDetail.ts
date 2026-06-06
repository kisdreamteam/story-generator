import { useCallback, useEffect, useState } from 'react'
import { getClassroomById } from '../api'
import {
  classifyClassroomLoadError,
  classroomNotFoundPresentation,
  invalidClassroomIdPresentation,
  isValidClassroomRouteId,
} from '../lib/classroomRouteGuards'
import type { Classroom, ClassroomLoadErrorPresentation, ClassroomLoadStatus } from '../types'

export interface UseClassroomDetailResult {
  status: ClassroomLoadStatus
  classroom: Classroom | null
  presentation: ClassroomLoadErrorPresentation | null
  reload: () => void
}

/** Load one classroom for the detail route — page → hook → placeholder API. */
export function useClassroomDetail(classroomId: string | undefined): UseClassroomDetailResult {
  const [status, setStatus] = useState<ClassroomLoadStatus>('loading')
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [presentation, setPresentation] = useState<ClassroomLoadErrorPresentation | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!isValidClassroomRouteId(classroomId)) {
      setClassroom(null)
      setPresentation(invalidClassroomIdPresentation())
      setStatus('invalid-id')
      return
    }

    let cancelled = false
    setStatus('loading')
    setPresentation(null)
    setClassroom(null)

    void (async () => {
      try {
        const result = await getClassroomById(classroomId)

        if (cancelled) return

        if (!result) {
          setClassroom(null)
          setPresentation(classroomNotFoundPresentation())
          setStatus('not-found')
          return
        }

        setClassroom(result)
        setPresentation(null)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setClassroom(null)
        setPresentation(classifyClassroomLoadError(error))
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [classroomId, reloadVersion])

  return { status, classroom, presentation, reload }
}
