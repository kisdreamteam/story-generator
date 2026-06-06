import type { RoleplayLine, RoleplayRole } from '../types'

const SPEECH_VERBS =
  'said|asked|whispered|repeated|added|shouted|explained|reminded|called|replied|answered|told|murmured|cheered'

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function matchRoleInSubject(subject: string): RoleplayRole | null {
  const normalized = subject.toLowerCase()

  if (/\bnino\b/.test(normalized)) return 'nino'
  if (/\bnina\b/.test(normalized)) return 'nina'
  if (/\b(ms\.?\s*lee|teacher|mrs\.?\s|mr\.?\s)\b/.test(normalized)) return 'teacher'
  if (/\b(firefighter\s+ana|\bana\b|classmate|sam\b|friend)\b/.test(normalized)) return 'friend'

  return null
}

function inferRoleFromSpeechContext(context: string): RoleplayRole | null {
  const window = context.toLowerCase()

  const beforeVerb = window.match(
    new RegExp(`([a-z][a-z\\s.'-]{0,40})\\s+(?:${SPEECH_VERBS})`, 'i'),
  )
  if (beforeVerb) {
    const role = matchRoleInSubject(beforeVerb[1])
    if (role) return role
  }

  const afterVerb = window.match(
    new RegExp(`(?:${SPEECH_VERBS})\\s+([a-z][a-z\\s.'-]{0,40})`, 'i'),
  )
  if (afterVerb) {
    const role = matchRoleInSubject(afterVerb[1])
    if (role) return role
  }

  if (/\bnino\b/.test(window)) return 'nino'
  if (/\bnina\b/.test(window)) return 'nina'
  if (/\b(ms\.?\s*lee|teacher|mrs\.?\s|mr\.?\s)\b/.test(window)) return 'teacher'
  if (/\b(firefighter\s+ana|\bana\b|classmate|sam\b|friend)\b/.test(window)) return 'friend'

  if (/\bhe\b/.test(window) && /\bnino\b/.test(window)) return 'nino'
  if (/\bshe\b/.test(window) && /\b(ms\.?\s*lee|teacher)\b/.test(window)) return 'teacher'
  if (/\bshe\b/.test(window) && /\bana\b/.test(window)) return 'friend'

  return null
}

function pushNarratorLines(
  text: string,
  pageNumber: number,
  lines: RoleplayLine[],
  lineSeed: { value: number },
): void {
  for (const sentence of splitIntoSentences(text)) {
    const normalized = normalizeWhitespace(sentence)
    if (!normalized) continue

    lineSeed.value += 1
    lines.push({
      id: `p${pageNumber}-l${lineSeed.value}`,
      role: 'narrator',
      text: normalized,
      pageNumber,
    })
  }
}

/** Parse one story page into roleplay lines using quotes and simple speaker heuristics. */
export function parseStoryPageTextToRoleplayLines(
  pageText: string,
  pageNumber: number,
  lineSeed: { value: number },
): RoleplayLine[] {
  const lines: RoleplayLine[] = []
  const quotePattern = /"([^"]*)"/g
  let lastIndex = 0

  for (const match of pageText.matchAll(quotePattern)) {
    const quoteStart = match.index ?? 0
    const dialogue = normalizeWhitespace(match[1])

    const narrativeBefore = pageText.slice(lastIndex, quoteStart).trim()
    if (narrativeBefore) {
      pushNarratorLines(narrativeBefore, pageNumber, lines, lineSeed)
    }

    if (dialogue) {
      const contextBefore = pageText.slice(Math.max(0, quoteStart - 90), quoteStart)
      const contextAfter = pageText.slice(
        quoteStart + match[0].length,
        quoteStart + match[0].length + 90,
      )
      const inferredRole =
        inferRoleFromSpeechContext(`${contextBefore} ${contextAfter}`) ?? 'narrator'

      lineSeed.value += 1
      lines.push({
        id: `p${pageNumber}-l${lineSeed.value}`,
        role: inferredRole,
        text: dialogue,
        pageNumber,
      })
    }

    lastIndex = quoteStart + match[0].length
  }

  const narrativeAfter = pageText.slice(lastIndex).trim()
  if (narrativeAfter) {
    pushNarratorLines(narrativeAfter, pageNumber, lines, lineSeed)
  }

  if (lines.length === 0 && pageText.trim()) {
    pushNarratorLines(pageText, pageNumber, lines, lineSeed)
  }

  return lines
}
