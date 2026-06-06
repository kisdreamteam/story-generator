import { DEFAULT_LANGUAGE } from '@/features/story-projects/config/formOptions'
import { defaultSeries } from '@/features/series/services/series.service'
import type { AppSettings } from '../types'

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultLanguage: DEFAULT_LANGUAGE,
  defaultAgeRange: '4-6',
  defaultStoryLength: '12',
  defaultSeriesId: defaultSeries.id,
  updatedAt: new Date(0).toISOString(),
}
