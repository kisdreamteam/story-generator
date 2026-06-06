import type { ClassroomLoadErrorPresentation } from '../types'

export function isValidClassroomRouteId(id: string | undefined): id is string {
  if (!id) return false
  const trimmed = id.trim()
  return trimmed.length > 0 && trimmed.length <= 128
}

export function invalidClassroomIdPresentation(): ClassroomLoadErrorPresentation {
  return {
    title: 'Invalid classroom link',
    description: 'This classroom link is not valid. Open Your classrooms and choose a classroom from the list.',
  }
}

export function classroomNotFoundPresentation(): ClassroomLoadErrorPresentation {
  return {
    title: 'Classroom not found',
    description:
      'We could not find this classroom. It may have been removed or is not available yet.',
  }
}

export function classifyClassroomLoadError(error: unknown): ClassroomLoadErrorPresentation {
  if (error instanceof Error && error.message.trim()) {
    return {
      title: 'Could not load classroom',
      description: error.message,
    }
  }

  return {
    title: 'Could not load classroom',
    description: 'Something went wrong while loading this classroom. Try again in a moment.',
  }
}
