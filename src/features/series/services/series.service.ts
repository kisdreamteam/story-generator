import type { Series } from '../types'

export const ninaNinoSeries: Series = {
  id: 'nina-nino',
  name: 'Nina & Nino',
  description:
    'Everyday adventures with Nina (the older child) and Nino (the younger child), two siblings exploring language, culture, and community.',
  available: true,
  characters: [
    { name: 'Nina', role: 'The older child — curious, thoughtful, loves writing new words in her notebook' },
    { name: 'Nino', role: 'The younger child — playful, observant, always asking questions' },
    { name: 'Mamá', role: 'Warm guide who introduces culture and everyday vocabulary' },
  ],
  visualContinuityNotes: [
    'Nina wears indigo; Nino wears emerald green',
    'Soft watercolor illustration style with warm golden-hour lighting',
    'Consistent woven basket prop when visiting markets or shops',
    'Neighborhood settings feel lively, safe, and culturally grounded',
  ],
  ageRange: '4–8',
  toneAndStyleNotes:
    'Warm, playful, and encouraging. Short sentences with natural dialogue. Write in clear, age-appropriate English.',
  vocabularyLevelNotes:
    'Introduce 4–6 new words per story. Repeat each word at least twice. Favor concrete nouns and simple verbs.',
}

export const newSeriesPlaceholder: Series = {
  id: 'new-series',
  name: 'New Series',
  description: 'More story worlds coming soon.',
  available: false,
  characters: [],
  visualContinuityNotes: [],
  ageRange: '',
  toneAndStyleNotes: '',
  vocabularyLevelNotes: '',
}

export const seriesList: Series[] = [ninaNinoSeries, newSeriesPlaceholder]

export const defaultSeries = ninaNinoSeries

export function getSeriesById(id: string): Series | undefined {
  return seriesList.find((s) => s.id === id)
}
