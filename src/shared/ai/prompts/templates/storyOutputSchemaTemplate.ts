const EXAMPLE_GENERATED_AT = '2026-06-06T14:00:00.000Z'

export function buildStoryOutputSchemaBlock(requiredPageCount: number): string {
  return [
    `Return JSON with exactly ${requiredPageCount} story pages.`,
    'Each page must include pageNumber, text, wordCount, and teachingFocus.',
    'Include flashcards (word, simpleDefinition, exampleSentence) and imagePrompts (pageNumber, prompt, continuityReminder) for each page.',
    '',
    'JSON shape:',
    JSON.stringify(
      {
        title: 'string',
        summary: 'string',
        totalWordCount: 0,
        generatedAt: EXAMPLE_GENERATED_AT,
        storyPages: [
          {
            pageNumber: 1,
            text: 'string',
            wordCount: 0,
            teachingFocus: 'string',
          },
        ],
        flashcards: [
          {
            word: 'string',
            simpleDefinition: 'string',
            exampleSentence: 'string',
          },
        ],
        imagePrompts: [
          {
            pageNumber: 1,
            prompt: 'string',
            continuityReminder: 'string',
          },
        ],
      },
      null,
      2,
    ),
  ].join('\n')
}
