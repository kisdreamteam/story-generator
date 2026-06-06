import type { StoryPage } from '@/features/stories/types'

export type StudentStoryLoadStatus =
  | 'loading'
  | 'ready'
  | 'not-found'
  | 'not-generated'
  | 'invalid-id'
  | 'error'

export interface StudentStoryLoadPresentation {
  title: string
  description: string
}

export type StudentStorySlide =
  | {
      kind: 'page'
      page: StoryPage
      index: number
      total: number
    }
  | {
      kind: 'activities'
    }
