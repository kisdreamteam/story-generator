import type {
  ImageAssetRecord,
  ImagePromptRecord,
  StoryImageGenerationRecord,
} from '../types'
import { storyImagePromptsFromRecords } from '../mappers/storyImagePromptMapping'
import type { StoryImagePrompt } from '@/features/stories/types'

export const STORY_IMAGE_GENERATION_STORAGE_KEY = 'story-image-generation-records'

function readAllRecords(): StoryImageGenerationRecord[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(STORY_IMAGE_GENERATION_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoryImageGenerationRecord)
  } catch {
    return []
  }
}

function writeAllRecords(records: StoryImageGenerationRecord[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(STORY_IMAGE_GENERATION_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore quota and private mode errors.
  }
}

function isStoryImageGenerationRecord(value: unknown): value is StoryImageGenerationRecord {
  if (!value || typeof value !== 'object') return false

  const record = value as StoryImageGenerationRecord

  return (
    typeof record.storyId === 'string' &&
    Array.isArray(record.prompts) &&
    Array.isArray(record.assets) &&
    typeof record.updatedAt === 'string'
  )
}

function upsertRecord(record: StoryImageGenerationRecord): StoryImageGenerationRecord {
  const records = readAllRecords()
  const index = records.findIndex((entry) => entry.storyId === record.storyId)

  if (index >= 0) {
    records[index] = record
  } else {
    records.push(record)
  }

  writeAllRecords(records)
  return record
}

export function loadStoryImageGenerationRecord(
  storyId: string,
): StoryImageGenerationRecord | null {
  return readAllRecords().find((record) => record.storyId === storyId) ?? null
}

export function deleteStoryImageGenerationRecord(storyId: string): void {
  writeAllRecords(readAllRecords().filter((record) => record.storyId !== storyId))
}

export function saveStoryImageGenerationRecord(
  record: StoryImageGenerationRecord,
): StoryImageGenerationRecord {
  return upsertRecord({
    ...record,
    updatedAt: new Date().toISOString(),
  })
}

export function upsertImagePromptRecords(
  storyId: string,
  prompts: ImagePromptRecord[],
): StoryImageGenerationRecord {
  const existing = loadStoryImageGenerationRecord(storyId)
  const now = new Date().toISOString()

  return saveStoryImageGenerationRecord({
    storyId,
    prompts,
    assets: existing?.assets ?? [],
    updatedAt: now,
  })
}

export function upsertImageAssetRecords(
  storyId: string,
  assets: ImageAssetRecord[],
): StoryImageGenerationRecord {
  const existing = loadStoryImageGenerationRecord(storyId)
  const now = new Date().toISOString()

  return saveStoryImageGenerationRecord({
    storyId,
    prompts: existing?.prompts ?? [],
    assets,
    updatedAt: now,
  })
}

/** Persist illustration prompts for a story without touching core story storage adapters. */
export function persistImagePromptsForStory(
  storyId: string,
  prompts: ImagePromptRecord[],
): StoryImageGenerationRecord {
  return upsertImagePromptRecords(storyId, prompts)
}

/** Read persisted prompts as the shared StoryImagePrompt shape. */
export function loadPersistedStoryImagePrompts(storyId: string): StoryImagePrompt[] {
  const record = loadStoryImageGenerationRecord(storyId)
  if (!record) return []

  return storyImagePromptsFromRecords(record.prompts)
}

/** Merge prompt and asset records for a story. Missing fields are preserved. */
export function mergeStoryImageGenerationRecord(
  storyId: string,
  patch: Partial<Pick<StoryImageGenerationRecord, 'prompts' | 'assets'>>,
): StoryImageGenerationRecord {
  const existing = loadStoryImageGenerationRecord(storyId)
  const now = new Date().toISOString()

  return saveStoryImageGenerationRecord({
    storyId,
    prompts: patch.prompts ?? existing?.prompts ?? [],
    assets: patch.assets ?? existing?.assets ?? [],
    updatedAt: now,
  })
}

export function listStoryImageGenerationRecords(): StoryImageGenerationRecord[] {
  return readAllRecords()
}
