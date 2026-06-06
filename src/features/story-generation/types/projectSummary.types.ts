export interface ProjectSummary {
  projectTitle: string
  seriesName: string
  language: string
  ageRange: string
  theme: string
  setting: string
  vocabularyFocus: string
  learningGoal: string
  pageCount: number
  totalWordCount: number
}

export interface ProjectSummaryField {
  label: string
  value: string
}
