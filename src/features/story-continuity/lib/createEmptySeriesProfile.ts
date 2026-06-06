import type { SeriesProfile } from '../models'

function createSeriesId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `series-${crypto.randomUUID()}`
    }
  } catch {
    // Fall through to timestamp id.
  }

  return `series-${Date.now()}`
}

/** Blank profile for a teacher-defined new series. */
export function createEmptySeriesProfile(name = 'New Series'): SeriesProfile {
  const now = new Date().toISOString()

  return {
    id: createSeriesId(),
    name,
    characters: [],
    relationships: [],
    appearanceNotes: [],
    recurringLocations: [],
    recurringRules: [],
    createdAt: now,
    updatedAt: now,
  }
}
