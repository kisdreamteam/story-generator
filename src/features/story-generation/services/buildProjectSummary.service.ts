import { getSeriesById } from '../../series/services/series.service'
import type { ProjectSummary, ProjectSummaryField } from '../types/projectSummary.types'
import type { StoryGenerationInput, StoryGenerationOutput } from '../types'

export function buildProjectSummary(
  story: StoryGenerationOutput,
  input: StoryGenerationInput,
): ProjectSummary {
  const series = getSeriesById(input.seriesId)

  return {
    projectTitle: story.title,
    seriesName: series?.name ?? 'Unknown series',
    language: input.language,
    ageRange: input.ageRange,
    theme: input.theme,
    setting: input.setting,
    vocabularyFocus: input.vocabularyFocus,
    learningGoal: input.learningGoal,
    pageCount: input.pageCount,
    totalWordCount: story.totalWordCount,
  }
}

export function formatProjectSummaryFields(summary: ProjectSummary): ProjectSummaryField[] {
  return [
    { label: 'Project title', value: summary.projectTitle },
    { label: 'Series', value: summary.seriesName },
    { label: 'Language', value: summary.language },
    { label: 'Age range', value: summary.ageRange },
    { label: 'Theme', value: summary.theme },
    { label: 'Setting', value: summary.setting },
    { label: 'Vocabulary focus', value: summary.vocabularyFocus },
    { label: 'Learning goal', value: summary.learningGoal },
    { label: 'Page count', value: String(summary.pageCount) },
    { label: 'Total word count', value: String(summary.totalWordCount) },
  ]
}
