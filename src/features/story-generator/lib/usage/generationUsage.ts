import type { GeneratedStoryOutput, StoryGenerationInput } from '../generation/types'

export type GenerationProviderKind = 'mock' | 'openai' | 'fixture'

export interface GenerationUsageRecord {
  id: string
  timestamp: string
  provider: GenerationProviderKind
  estimatedTokens: number
  generationMode: string
}

export interface GenerationUsageSnapshot {
  totalGenerations: number
  totalEstimatedTokens: number
  records: GenerationUsageRecord[]
}

const STORAGE_KEY = 'story-generation-usage'

function readRecords(): GenerationUsageRecord[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isGenerationUsageRecord)
  } catch {
    return []
  }
}

function writeRecords(records: GenerationUsageRecord[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore quota / private mode errors.
  }
}

function isGenerationUsageRecord(value: unknown): value is GenerationUsageRecord {
  if (!value || typeof value !== 'object') return false

  const record = value as GenerationUsageRecord

  return (
    typeof record.id === 'string' &&
    typeof record.timestamp === 'string' &&
    typeof record.provider === 'string' &&
    typeof record.estimatedTokens === 'number' &&
    typeof record.generationMode === 'string'
  )
}

/** Rough token estimate from setup + output text (local heuristic, not billing-grade). */
export function estimateTokenUsage(
  input: StoryGenerationInput,
  output?: GeneratedStoryOutput,
): number {
  const setupChars = JSON.stringify(input.setup).length
  const outputChars = output ? JSON.stringify(output).length : 0
  const pageOverhead = Math.max(input.setup.pageCount, 1) * 250

  return Math.ceil((setupChars + outputChars) / 4 + pageOverhead)
}

export function getGenerationUsage(): GenerationUsageSnapshot {
  const records = readRecords()

  return {
    totalGenerations: records.length,
    totalEstimatedTokens: records.reduce((sum, record) => sum + record.estimatedTokens, 0),
    records,
  }
}

export function getGenerationUsageForDate(isoDate: string): GenerationUsageSnapshot {
  const records = readRecords().filter((record) => record.timestamp.startsWith(isoDate))

  return {
    totalGenerations: records.length,
    totalEstimatedTokens: records.reduce((sum, record) => sum + record.estimatedTokens, 0),
    records,
  }
}

export interface RecordGenerationInput {
  provider: GenerationProviderKind
  estimatedTokens: number
  generationMode: string
  input?: StoryGenerationInput
  output?: GeneratedStoryOutput
}

/** Persist one completed generation to local usage history. */
export function recordGeneration(entry: RecordGenerationInput): GenerationUsageRecord {
  const estimatedTokens =
    entry.estimatedTokens > 0
      ? entry.estimatedTokens
      : estimateTokenUsage(entry.input ?? { setup: emptySetup() }, entry.output)

  const record: GenerationUsageRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    provider: entry.provider,
    estimatedTokens,
    generationMode: entry.generationMode,
  }

  const records = readRecords()
  records.push(record)
  writeRecords(records)

  return record
}

function emptySetup(): StoryGenerationInput['setup'] {
  return {
    storyPurpose: '',
    storyTone: '',
    theme: '',
    setting: '',
    vocabularyFocus: '',
    lessonGoal: '',
    mainEvents: '',
    wordsToInclude: '',
    wordsToAvoid: '',
    pageCount: 1,
    notes: '',
    ageRange: '',
    language: '',
    characters: '',
  }
}

export function clearGenerationUsage(): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export function getTodayIsoDate(at: Date = new Date()): string {
  return at.toISOString().slice(0, 10)
}
