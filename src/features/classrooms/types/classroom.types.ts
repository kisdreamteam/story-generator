/** Persisted classroom record for teacher class organization. */
export interface Classroom {
  id: string
  name: string
  ageRange: string
  language: string
  createdAt: string
  updatedAt: string
}

/** Input for creating a classroom before persistence assigns timestamps. */
export interface CreateClassroomInput {
  name: string
  ageRange: string
  language: string
  id?: string
}

export type ClassroomLoadStatus = 'loading' | 'ready' | 'not-found' | 'invalid-id' | 'error'

export interface ClassroomLoadErrorPresentation {
  title: string
  description: string
}
