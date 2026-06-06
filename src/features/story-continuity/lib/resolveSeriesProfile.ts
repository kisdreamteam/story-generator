import { defaultSeries } from '@/features/series/services/series.service'
import { SeriesContinuityMode, type ResolveSeriesProfileInput, type SeriesProfile } from '../models'
import { createEmptySeriesProfile } from './createEmptySeriesProfile'
import { seriesProfileFromCatalogId } from './seriesProfileFromSeries'
import { loadSeriesProfile } from './seriesProfileStorage'

export const DEFAULT_EXISTING_SERIES_ID = defaultSeries.id

/** Resolve the active series profile for new or existing series mode. */
export function resolveSeriesProfile(input: ResolveSeriesProfileInput): SeriesProfile | null {
  const seriesId = input.seriesId

  if (input.mode === SeriesContinuityMode.NEW) {
    if (!seriesId) {
      return createEmptySeriesProfile()
    }

    return loadSeriesProfile(seriesId) ?? createEmptySeriesProfile()
  }

  if (!seriesId) {
    return seriesProfileFromCatalogId(DEFAULT_EXISTING_SERIES_ID)
  }

  const savedProfile = loadSeriesProfile(seriesId)
  if (savedProfile) {
    return savedProfile
  }

  return seriesProfileFromCatalogId(seriesId)
}
