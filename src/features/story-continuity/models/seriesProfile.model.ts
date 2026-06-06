/** Whether the teacher is starting a new series or continuing an existing one. */
export const SeriesContinuityMode = {
  NEW: 'new',
  EXISTING: 'existing',
} as const

export type SeriesContinuityMode =
  (typeof SeriesContinuityMode)[keyof typeof SeriesContinuityMode]

export interface SeriesCharacterProfile {
  name: string
  role?: string
  appearanceNotes?: string
}

export interface SeriesRelationship {
  /** Character names in this relationship. */
  between: [string, string]
  description: string
}

/** Persisted continuity profile for a story series. */
export interface SeriesProfile {
  id: string
  name: string
  characters: SeriesCharacterProfile[]
  relationships: SeriesRelationship[]
  appearanceNotes: string[]
  recurringLocations: string[]
  recurringRules: string[]
  /** ISO timestamp when the profile was created. */
  createdAt: string
  /** ISO timestamp when the profile was last updated. */
  updatedAt: string
}

/** Resolved continuity payload for story generation (future use). */
export interface ContinuityContext {
  mode: SeriesContinuityMode
  seriesId: string | null
  profile: SeriesProfile | null
  /** Plain-text summary suitable for prompt injection. */
  summary: string
}

export interface ResolveSeriesProfileInput {
  mode: SeriesContinuityMode
  seriesId?: string | null
}

export interface BuildContinuityContextInput {
  mode: SeriesContinuityMode
  seriesId?: string | null
  profile?: SeriesProfile | null
}
