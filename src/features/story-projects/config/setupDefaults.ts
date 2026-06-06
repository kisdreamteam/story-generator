import { ninaNinoSeries } from '../../series/services/series.service'

export const ninaNinoSetupDefaults = {
  storyPurpose: 'Introduce vocabulary',
  storyTone: 'Warm',
  mainEvents: `Arrive at the farmers market with Mamá
Meet friendly vendors and greet them politely
Discover and name fruits, colors, and food items
Practice new words together while exploring the stalls
Walk home and share what they learned`,
  wordsToInclude: '',
  wordsToAvoid: '',
  theme: 'Everyday adventure with family',
  setting: 'Local farmers market and neighborhood streets',
  vocabularyFocus: 'Food, colors, and greetings',
  learningGoal: 'Practice 4–6 new English words through dialogue and repetition',
  pageCount: '5',
  notes: `Keep tone warm and playful. Include Mamá as a supporting character. Nina is the older child; Nino is the younger child — they are siblings, not twins.

Series tone: ${ninaNinoSeries.toneAndStyleNotes}`,
}
