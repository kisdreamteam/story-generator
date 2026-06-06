/** JSON export envelope — versioned for future format changes. */
export interface StoryExportJsonPayload {
  exportVersion: 1
  exportedAt: string
  projectTitle: string
  story: import('@/features/stories/types').GeneratedStory
}

export interface StoryTextExportOptions {
  projectTitle?: string
  includeSummary?: boolean
  includeTeachingFocus?: boolean
}
