import { DEFAULT_LANGUAGE } from '../../story-projects/config/formOptions'
import { ninaNinoSeries } from '../../series/services/series.service'
import { ninaNinoSetupDefaults } from '../../story-projects/config/setupDefaults'
import { getProjectById } from '../../story-projects/services/projects.service'
import type { StoryGenerationInput } from '../types'

interface BuildStoryGenerationInputParams {
  projectId: string
  seriesId?: string
  language?: string
  ageRange?: string
  theme?: string
  setting?: string
  vocabularyFocus?: string
  learningGoal?: string
  pageCount?: string | number
  notes?: string
}

export function buildStoryGenerationInput({
  projectId,
  seriesId = 'nina-nino',
  language,
  ageRange,
  theme = ninaNinoSetupDefaults.theme,
  setting = ninaNinoSetupDefaults.setting,
  vocabularyFocus = ninaNinoSetupDefaults.vocabularyFocus,
  learningGoal = ninaNinoSetupDefaults.learningGoal,
  pageCount = ninaNinoSetupDefaults.pageCount,
  notes = ninaNinoSetupDefaults.notes,
}: BuildStoryGenerationInputParams): StoryGenerationInput {
  const project = getProjectById(projectId)
  const series = seriesId === 'nina-nino' ? ninaNinoSeries : ninaNinoSeries

  return {
    projectId,
    seriesId: project?.seriesId ?? seriesId,
    language: language ?? project?.targetLanguage ?? DEFAULT_LANGUAGE,
    ageRange: ageRange ?? project?.ageGroup ?? '4-6',
    theme,
    setting,
    vocabularyFocus,
    learningGoal,
    pageCount: typeof pageCount === 'string' ? Number(pageCount) : pageCount,
    notes,
    visualContinuityNotes: series.visualContinuityNotes,
  }
}
