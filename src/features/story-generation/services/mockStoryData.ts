import type { GeneratedStoryPage } from '../types'

export const mockPages: Omit<GeneratedStoryPage, 'wordCount'>[] = [
  {
    pageNumber: 1,
    text: 'Nina and Nino woke up to a sunny Saturday. "Let\'s go to the market!" said Mamá, packing a woven basket.',
    teachingFocus: 'Introduce market and family outing vocabulary through dialogue.',
  },
  {
    pageNumber: 2,
    text: 'At the market, colorful stalls lined the street. Nina pointed at ripe mangoes. "Look, Nino! They are yellow and sweet."',
    teachingFocus: 'Practice colors and descriptive words with market nouns.',
  },
  {
    pageNumber: 3,
    text: 'Nino found a stall with fresh bread rolls. The vendor smiled. "Good morning, children. Would you like to try one?"',
    teachingFocus: 'Model polite greetings and food vocabulary in context.',
  },
  {
    pageNumber: 4,
    text: 'The siblings practiced new words at every stop: apple, cheese, flowers. Nina wrote each one in her little notebook.',
    teachingFocus: 'Reinforce vocabulary through repetition and active note-taking.',
  },
  {
    pageNumber: 5,
    text: 'On the walk home, Nina and Nino counted their treasures. "It was a great day," they said together, holding Mamá\'s hands.',
    teachingFocus: 'Close with reflection language and emotional vocabulary.',
  },
]

export const mockFlashcards = [
  {
    word: 'market',
    simpleDefinition: 'a place where people buy food and goods',
    exampleSentence: "Let's go to the market!",
  },
  {
    word: 'mango',
    simpleDefinition: 'a sweet yellow fruit',
    exampleSentence: 'They are yellow and sweet.',
  },
  {
    word: 'bread',
    simpleDefinition: 'baked food made from flour',
    exampleSentence: 'Nino found a stall with fresh bread rolls.',
  },
  {
    word: 'apple',
    simpleDefinition: 'a round fruit that can be red or green',
    exampleSentence: 'The siblings practiced new words: apple, cheese, flowers.',
  },
  {
    word: 'cheese',
    simpleDefinition: 'a food made from milk',
    exampleSentence: 'The siblings practiced new words: apple, cheese, flowers.',
  },
  {
    word: 'flowers',
    simpleDefinition: 'colorful plant blooms',
    exampleSentence: 'The siblings practiced new words: apple, cheese, flowers.',
  },
]

export const mockImagePrompts = [
  {
    pageNumber: 1,
    prompt:
      'Warm children\'s book illustration of siblings Nina and Nino in a sunny kitchen, Mamá holding a woven basket, soft watercolor style',
    continuityReminder: 'Nina (older) in indigo, Nino (younger) in emerald green; warm golden-hour lighting',
  },
  {
    pageNumber: 2,
    prompt:
      'Vibrant outdoor farmers market with fruit stalls, Nina pointing at yellow mangoes, Nino beside her, lively neighborhood market',
    continuityReminder: 'Keep watercolor style and woven basket visible at Mamá\'s side',
  },
  {
    pageNumber: 3,
    prompt:
      'Friendly bakery vendor offering bread rolls to curious children at a market stall, cozy and inviting atmosphere',
    continuityReminder: 'Match character outfits and soft watercolor palette from prior pages',
  },
  {
    pageNumber: 4,
    prompt:
      'Close-up of a child\'s notebook with English vocabulary words, colorful market blurred in background',
    continuityReminder: 'Nina\'s indigo clothing; notebook prop consistent with series',
  },
  {
    pageNumber: 5,
    prompt:
      'Family walking home at golden hour, full market basket, Nina and Nino holding Mamá\'s hands on a quiet street',
    continuityReminder: 'Golden-hour lighting, woven basket, safe neighborhood setting',
  },
]
