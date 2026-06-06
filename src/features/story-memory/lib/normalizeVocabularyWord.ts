/** Case-insensitive key for comparing vocabulary words. */
export function normalizeVocabularyWord(word: string): string {
  return word.trim().toLowerCase()
}

export function isNonEmptyVocabularyWord(word: string): boolean {
  return normalizeVocabularyWord(word).length > 0
}
