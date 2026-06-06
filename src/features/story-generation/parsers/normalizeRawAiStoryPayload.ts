import type {
  GeneratedFlashcardContract,
  GeneratedImagePromptContract,
  GeneratedStoryPageContract,
  StoryResponseContractFlat,
} from '@/features/story-generator/lib/generation/contracts/storyResponseContract'
import { countStoryWords } from '@/features/stories/utils/storyEdit'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readPositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10)
    return Number.isInteger(parsed) && parsed >= 1 ? parsed : null
  }

  return null
}

function readNonNegativeNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value) && value >= 0) {
    return value
  }

  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) {
    const parsed = Number.parseFloat(value.trim())
    return Number.isNaN(parsed) || parsed < 0 ? null : parsed
  }

  return null
}

function readIsoTimestamp(value: unknown): string | null {
  const raw = readTrimmedString(value)

  if (!raw) {
    return null
  }

  const timestamp = Date.parse(raw)

  if (Number.isNaN(timestamp)) {
    return null
  }

  return new Date(timestamp).toISOString()
}

/** Pull JSON text from raw provider output — strips markdown fences and surrounding prose. */
export function extractJsonFromAiResponse(raw: string): string | null {
  const trimmed = raw.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)

  if (fencedMatch?.[1]) {
    const fenced = fencedMatch[1].trim()
    return fenced.length > 0 ? fenced : null
  }

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')

  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1)
  }

  return null
}

function normalizeStoryPage(value: unknown, index: number): GeneratedStoryPageContract | null {
  if (!isRecord(value)) {
    return null
  }

  const pageNumber = readPositiveInteger(value.pageNumber) ?? index + 1
  const text = readTrimmedString(value.text)
  const teachingFocus = readTrimmedString(value.teachingFocus)

  if (!text || !teachingFocus) {
    return null
  }

  return {
    pageNumber,
    text,
    wordCount: countStoryWords(text),
    teachingFocus,
  }
}

function normalizeFlashcard(value: unknown): GeneratedFlashcardContract | null {
  if (!isRecord(value)) {
    return null
  }

  const word = readTrimmedString(value.word)
  const simpleDefinition = readTrimmedString(value.simpleDefinition)
  const exampleSentence = readTrimmedString(value.exampleSentence)

  if (!word || !simpleDefinition || !exampleSentence) {
    return null
  }

  return { word, simpleDefinition, exampleSentence }
}

function normalizeImagePrompt(value: unknown, index: number): GeneratedImagePromptContract | null {
  if (!isRecord(value)) {
    return null
  }

  const pageNumber = readPositiveInteger(value.pageNumber) ?? index + 1
  const prompt = readTrimmedString(value.prompt)
  const continuityReminder = readTrimmedString(value.continuityReminder)

  if (!prompt || !continuityReminder) {
    return null
  }

  return { pageNumber, prompt, continuityReminder }
}

function resolveStoryPagesArray(data: Record<string, unknown>): unknown {
  return data.storyPages ?? data.pages
}

function resolveMetadataFields(
  parsed: Record<string, unknown>,
): {
  title: string
  summary: string
  generatedAt: string
  totalWordCount: number | null
} | null {
  const metadata = isRecord(parsed.metadata) ? parsed.metadata : parsed

  const title = readTrimmedString(metadata.title)
  const summary = readTrimmedString(metadata.summary)

  if (!title || !summary) {
    return null
  }

  const generatedAt = readIsoTimestamp(metadata.generatedAt) ?? new Date().toISOString()
  const totalWordCount = readNonNegativeNumber(metadata.totalWordCount)

  return { title, summary, generatedAt, totalWordCount }
}

/**
 * Normalize untrusted AI JSON into a flat response contract.
 * Returns null when required fields cannot be recovered safely.
 */
export function normalizeRawAiStoryPayload(parsed: unknown): StoryResponseContractFlat | null {
  if (!isRecord(parsed)) {
    return null
  }

  const metadata = resolveMetadataFields(parsed)

  if (!metadata) {
    return null
  }

  const rawPages = resolveStoryPagesArray(parsed)

  if (!Array.isArray(rawPages) || rawPages.length === 0) {
    return null
  }

  const storyPages = rawPages
    .map((page, index) => normalizeStoryPage(page, index))
    .filter((page): page is GeneratedStoryPageContract => page !== null)

  if (storyPages.length === 0 || storyPages.length !== rawPages.length) {
    return null
  }

  const rawFlashcards = parsed.flashcards

  if (!Array.isArray(rawFlashcards) || rawFlashcards.length === 0) {
    return null
  }

  const flashcards = rawFlashcards
    .map((card) => normalizeFlashcard(card))
    .filter((card): card is GeneratedFlashcardContract => card !== null)

  if (flashcards.length === 0 || flashcards.length !== rawFlashcards.length) {
    return null
  }

  const rawImagePrompts = parsed.imagePrompts

  if (!Array.isArray(rawImagePrompts) || rawImagePrompts.length === 0) {
    return null
  }

  const imagePrompts = rawImagePrompts
    .map((prompt, index) => normalizeImagePrompt(prompt, index))
    .filter((prompt): prompt is GeneratedImagePromptContract => prompt !== null)

  if (imagePrompts.length === 0 || imagePrompts.length !== rawImagePrompts.length) {
    return null
  }

  const totalWordCount =
    storyPages.reduce((total, page) => total + page.wordCount, 0) ||
    metadata.totalWordCount ||
    0

  return {
    title: metadata.title,
    summary: metadata.summary,
    storyPages,
    flashcards,
    imagePrompts,
    totalWordCount,
    generatedAt: metadata.generatedAt,
  }
}
