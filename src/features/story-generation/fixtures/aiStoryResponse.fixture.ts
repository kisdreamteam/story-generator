/**
 * Raw JSON string mimicking an AI provider response for parse/validation testing.
 * Shape matches StoryGenerationOutput fields the parser expects (title, summary, pages, etc.).
 * projectId and generatedAt are injected by parseAiStoryResponse() from the request input.
 */
export const AI_STORY_RESPONSE_FIXTURE_RAW = JSON.stringify({
  title: 'Nina and Nino at the Rainy-Day Library',
  summary:
    'On a rainy afternoon, Nina and Nino visit the local library, meet the librarian, and practice new words about books and quiet spaces.',
  pages: [
    {
      pageNumber: 1,
      text: 'Rain tapped on the window. Nina looked at Nino and smiled. "The library is perfect today," she said.',
      wordCount: 18,
      teachingFocus: 'Introduce weather and indoor activity vocabulary through dialogue.',
    },
    {
      pageNumber: 2,
      text: 'Inside, shelves reached the ceiling. Nino whispered, "So many books!" The librarian waved hello.',
      wordCount: 14,
      teachingFocus: 'Practice library nouns and polite greetings in a quiet setting.',
    },
    {
      pageNumber: 3,
      text: 'They chose a story about two siblings. On the walk home, they practiced new words: whisper, shelf, story.',
      wordCount: 18,
      teachingFocus: 'Reinforce vocabulary through reflection after reading together.',
    },
  ],
  flashcards: [
    {
      word: 'library',
      simpleDefinition: 'a place where people borrow and read books',
      exampleSentence: 'The library is perfect today.',
    },
    {
      word: 'whisper',
      simpleDefinition: 'to speak very quietly',
      exampleSentence: 'Nino whispered, "So many books!"',
    },
    {
      word: 'shelf',
      simpleDefinition: 'a flat board that holds books',
      exampleSentence: 'Inside, shelves reached the ceiling.',
    },
  ],
  imagePrompts: [
    {
      pageNumber: 1,
      prompt:
        "Cozy children's book illustration of Nina and Nino at a rain-streaked window, soft watercolor, warm indoor light",
      continuityReminder: 'Nina (older) in indigo, Nino (younger) in emerald green; rainy-day palette',
    },
    {
      pageNumber: 2,
      prompt:
        'Quiet library interior with tall bookshelves, Nino whispering, friendly librarian waving, gentle watercolor style',
      continuityReminder: 'Keep sibling outfits and soft watercolor style consistent',
    },
    {
      pageNumber: 3,
      prompt:
        'Siblings walking home under shared umbrella, holding a library book, smiling and practicing new words',
      continuityReminder: 'Same character designs and rainy-day lighting as previous pages',
    },
  ],
  totalWordCount: 50,
})
