import { seriesList } from '@/features/series/services/series.service'
import { useCallback, useMemo, useState } from 'react'
import {
  SeriesContinuityMode,
  type ContinuityContext,
  type SeriesContinuityMode as SeriesContinuityModeType,
  type SeriesProfile,
} from '../models'
import { buildContinuityContext } from '../lib/buildContinuityContext'
import { createEmptySeriesProfile } from '../lib/createEmptySeriesProfile'
import { DEFAULT_EXISTING_SERIES_ID, resolveSeriesProfile } from '../lib/resolveSeriesProfile'
import { saveSeriesProfile } from '../lib/seriesProfileStorage'

export interface UseSeriesContinuityOptions {
  mode?: SeriesContinuityModeType
  seriesId?: string | null
}

export interface UseSeriesContinuityResult {
  mode: SeriesContinuityModeType
  seriesId: string | null
  profile: SeriesProfile | null
  context: ContinuityContext
  isNewSeries: boolean
  isExistingSeries: boolean
  availableExistingSeriesIds: string[]
  setMode: (mode: SeriesContinuityModeType) => void
  setSeriesId: (seriesId: string | null) => void
  saveProfile: (profile: SeriesProfile) => SeriesProfile
  startNewSeries: (name?: string) => SeriesProfile
  selectExistingSeries: (seriesId: string) => void
  reload: () => void
}

/** Manage new vs existing series continuity for future story generation. */
export function useSeriesContinuity(
  initial?: UseSeriesContinuityOptions,
): UseSeriesContinuityResult {
  const [mode, setMode] = useState<SeriesContinuityModeType>(
    initial?.mode ?? SeriesContinuityMode.EXISTING,
  )
  const [seriesId, setSeriesId] = useState<string | null>(
    initial?.seriesId ?? DEFAULT_EXISTING_SERIES_ID,
  )
  const [version, setVersion] = useState(0)

  const availableExistingSeriesIds = useMemo(
    () => seriesList.filter((series) => series.available).map((series) => series.id),
    [],
  )

  const profile = useMemo(() => {
    return resolveSeriesProfile({ mode, seriesId })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version triggers reload after saves
  }, [mode, seriesId, version])

  const context = useMemo(
    () => buildContinuityContext({ mode, seriesId, profile }),
    [mode, seriesId, profile],
  )

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  const saveProfile = useCallback(
    (nextProfile: SeriesProfile) => {
      const saved = saveSeriesProfile(nextProfile)
      setSeriesId(saved.id)
      setVersion((current) => current + 1)
      return saved
    },
    [],
  )

  const startNewSeries = useCallback(
    (name?: string) => {
      const created = createEmptySeriesProfile(name)
      const saved = saveSeriesProfile(created)
      setMode(SeriesContinuityMode.NEW)
      setSeriesId(saved.id)
      setVersion((current) => current + 1)
      return saved
    },
    [],
  )

  const selectExistingSeries = useCallback((nextSeriesId: string) => {
    setMode(SeriesContinuityMode.EXISTING)
    setSeriesId(nextSeriesId)
    setVersion((current) => current + 1)
  }, [])

  return {
    mode,
    seriesId,
    profile,
    context,
    isNewSeries: mode === SeriesContinuityMode.NEW,
    isExistingSeries: mode === SeriesContinuityMode.EXISTING,
    availableExistingSeriesIds,
    setMode,
    setSeriesId,
    saveProfile,
    startNewSeries,
    selectExistingSeries,
    reload,
  }
}
