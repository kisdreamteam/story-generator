export interface SeriesCharacter {
  name: string
  role: string
}

export interface Series {
  id: string
  name: string
  description: string
  available: boolean
  characters: SeriesCharacter[]
  visualContinuityNotes: string[]
  ageRange: string
  toneAndStyleNotes: string
  vocabularyLevelNotes: string
}
