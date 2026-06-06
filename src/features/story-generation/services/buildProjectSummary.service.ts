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
    storyPurpose: input.storyPurpose,
    storyTone: input.storyTone,
    mainEvents: input.mainEvents,
    wordsToInclude: input.wordsToInclude,
    wordsToAvoid: input.wordsToAvoid,
    theme: input.theme,
    setting: input.setting,
    vocabularyFocus: input.vocabularyFocus,
    learningGoal: input.learningGoal,
    pageCount: input.pageCount,
    totalWordCount: story.totalWordCount,
  }
}

function optionalSummaryField(label: string, value?: string): ProjectSummaryField[] {
  if (!value?.trim()) return []
  return [{ label, value: value.trim() }]
}

export function formatProjectSummaryFields(summary: ProjectSummary): ProjectSummaryField[] {
  return [
    { label: 'Project title', value: summary.projectTitle },
    { label: 'Series', value: summary.seriesName },
    { label: 'Language', value: summary.language },
    { label: 'Age range', value: summary.ageRange },
    ...optionalSummaryField('Story purpose', summary.storyPurpose),
    ...optionalSummaryField('Story tone', summary.storyTone),
    ...optionalSummaryField('Main events', summary.mainEvents),
    ...optionalSummaryField('Words to include', summary.wordsToInclude),
    ...optionalSummaryField('Words to avoid', summary.wordsToAvoid),
    { label: 'Theme', value: summary.theme },
    { label: 'Setting', value: summary.setting },
    { label: 'Vocabulary focus', value: summary.vocabularyFocus },
    { label: 'Learning goal', value: summary.learningGoal },
    { label: 'Page count', value: String(summary.pageCount) },
    { label: 'Total word count', value: String(summary.totalWordCount) },
  ]
}
