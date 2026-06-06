import { getSeriesById } from '@/features/series/services/series.service'
import type { Series } from '@/features/series/types'
import type { SeriesProfile, SeriesRelationship } from '../models'

function inferDefaultRelationships(series: Series): SeriesRelationship[] {
  if (series.id !== 'nina-nino') {
    return []
  }

  return [
    {
      between: ['Nina', 'Nino'],
      description: 'Siblings who explore and learn together.',
    },
    {
      between: ['Nina', 'Mamá'],
      description: 'Nina learns from Mamá’s guidance and cultural stories.',
    },
    {
      between: ['Nino', 'Mamá'],
      description: 'Nino looks to Mamá for warmth and explanations.',
    },
  ]
}

/** Map a built-in catalog series into a continuity profile. */
export function seriesProfileFromSeries(series: Series): SeriesProfile {
  const now = new Date().toISOString()

  return {
    id: series.id,
    name: series.name,
    characters: series.characters.map((character) => ({
      name: character.name,
      role: character.role,
    })),
    relationships: inferDefaultRelationships(series),
    appearanceNotes: [...series.visualContinuityNotes],
    recurringLocations: [],
    recurringRules: [series.toneAndStyleNotes, series.vocabularyLevelNotes].filter(Boolean),
    createdAt: now,
    updatedAt: now,
  }
}

/** Resolve a built-in series profile by catalog id. Returns null when unknown. */
export function seriesProfileFromCatalogId(seriesId: string): SeriesProfile | null {
  const series = getSeriesById(seriesId)
  if (!series || !series.available) {
    return null
  }

  return seriesProfileFromSeries(series)
}
