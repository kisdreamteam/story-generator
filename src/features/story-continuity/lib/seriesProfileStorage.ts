import type { SeriesProfile } from '../models'

export const SERIES_PROFILE_STORAGE_KEY = 'series-profiles'

function isSeriesProfile(value: unknown): value is SeriesProfile {
  if (!value || typeof value !== 'object') return false

  const profile = value as SeriesProfile
  return (
    typeof profile.id === 'string' &&
    profile.id.length > 0 &&
    typeof profile.name === 'string' &&
    Array.isArray(profile.characters) &&
    Array.isArray(profile.relationships) &&
    Array.isArray(profile.appearanceNotes) &&
    Array.isArray(profile.recurringLocations) &&
    Array.isArray(profile.recurringRules) &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  )
}

function readProfiles(): SeriesProfile[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(SERIES_PROFILE_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isSeriesProfile)
  } catch {
    return []
  }
}

function writeProfiles(profiles: SeriesProfile[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(SERIES_PROFILE_STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // Ignore quota / private mode errors.
  }
}

/** Persist or update a series profile keyed by id. */
export function saveSeriesProfile(profile: SeriesProfile): SeriesProfile {
  if (!profile.id) {
    return profile
  }

  const now = new Date().toISOString()
  const nextProfile: SeriesProfile = {
    ...profile,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  }

  const profiles = readProfiles()
  const existingIndex = profiles.findIndex((item) => item.id === nextProfile.id)

  if (existingIndex >= 0) {
    profiles[existingIndex] = nextProfile
  } else {
    profiles.push(nextProfile)
  }

  writeProfiles(profiles)
  return nextProfile
}

/** Load a saved profile by id. Does not fall back to catalog series. */
export function loadSeriesProfile(seriesId: string): SeriesProfile | null {
  if (!seriesId) return null

  return readProfiles().find((profile) => profile.id === seriesId) ?? null
}

/** Load all saved custom series profiles. */
export function loadAllSeriesProfiles(): SeriesProfile[] {
  return readProfiles().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

/** Remove a saved profile. No-op when the id is missing. */
export function deleteSeriesProfile(seriesId: string): void {
  if (!seriesId) return

  writeProfiles(readProfiles().filter((profile) => profile.id !== seriesId))
}
