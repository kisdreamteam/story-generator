import type { StoryImagePrompt } from '@/features/stories/types'
import type { AIImagePromptOutput } from '../../types'
import type { ImagePromptRecord } from '../types'

function createPromptId(): string {
  return `img-prompt-${crypto.randomUUID()}`
}

export function imagePromptRecordFromStoryPrompt(
  storyId: string,
  prompt: StoryImagePrompt,
  existing?: ImagePromptRecord,
): ImagePromptRecord {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? createPromptId(),
    storyId,
    pageNumber: prompt.pageNumber,
    prompt: prompt.prompt,
    continuityReminder: prompt.continuityReminder,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function imagePromptRecordFromAIOutput(
  storyId: string,
  prompt: AIImagePromptOutput,
  existing?: ImagePromptRecord,
): ImagePromptRecord {
  return imagePromptRecordFromStoryPrompt(
    storyId,
    {
      pageNumber: prompt.pageNumber,
      prompt: prompt.prompt,
      continuityReminder: prompt.continuityReminder,
    },
    existing,
  )
}

export function storyImagePromptFromRecord(record: ImagePromptRecord): StoryImagePrompt {
  return {
    pageNumber: record.pageNumber,
    prompt: record.prompt,
    continuityReminder: record.continuityReminder,
  }
}

export function storyImagePromptsFromRecords(records: ImagePromptRecord[]): StoryImagePrompt[] {
  return [...records]
    .sort((left, right) => left.pageNumber - right.pageNumber)
    .map(storyImagePromptFromRecord)
}

export function buildImageGenerationInputKey(input: {
  storyId: string
  mode: string
  pageNumbers: number[]
}): string {
  return JSON.stringify(input)
}
