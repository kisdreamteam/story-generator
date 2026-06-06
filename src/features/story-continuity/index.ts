/**
 * Story continuity — series profiles and context for future generation.
 * Not wired to story generation yet.
 */

export {
  SeriesContinuityMode,
  type BuildContinuityContextInput,
  type ContinuityContext,
  type ResolveSeriesProfileInput,
  type SeriesCharacterProfile,
  type SeriesProfile,
  type SeriesRelationship,
} from './models'
export {
  buildContinuityContext,
  buildContinuitySummary,
  createEmptySeriesProfile,
  DEFAULT_EXISTING_SERIES_ID,
  deleteSeriesProfile,
  loadAllSeriesProfiles,
  loadSeriesProfile,
  resolveSeriesProfile,
  saveSeriesProfile,
  seriesProfileFromCatalogId,
  seriesProfileFromSeries,
  SERIES_PROFILE_STORAGE_KEY,
} from './lib'
export {
  useSeriesContinuity,
  type UseSeriesContinuityOptions,
  type UseSeriesContinuityResult,
} from './hooks'
