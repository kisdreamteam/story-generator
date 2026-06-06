import type { StoryImagePrompt, StoryPage } from '@/features/stories/types'

export function cloneImagePrompts(prompts: StoryImagePrompt[]): StoryImagePrompt[] {
  return prompts.map((prompt) => ({ ...prompt }))
}

export function findImagePromptForPage(
  prompts: StoryImagePrompt[],
  pageNumber: number,
): StoryImagePrompt {
  return (
    prompts.find((item) => item.pageNumber === pageNumber) ?? {
      pageNumber,
      prompt: '',
      continuityReminder: '',
    }
  )
}

/** Ensure every story page has a prompt entry (empty strings when missing). */
export function alignImagePromptsToPages(
  pages: StoryPage[],
  prompts: StoryImagePrompt[],
): StoryImagePrompt[] {
  const sortedPages = [...pages].sort((left, right) => left.pageNumber - right.pageNumber)

  return sortedPages.map((page) => findImagePromptForPage(prompts, page.pageNumber))
}

export function imagePromptContentEqual(left: StoryImagePrompt, right: StoryImagePrompt): boolean {
  return (
    left.pageNumber === right.pageNumber &&
    left.prompt.trim() === right.prompt.trim() &&
    left.continuityReminder.trim() === right.continuityReminder.trim()
  )
}

export function imagePromptsEqual(
  left: StoryImagePrompt[],
  right: StoryImagePrompt[],
): boolean {
  if (left.length !== right.length) {
    return false
  }

  const sortedLeft = [...left].sort((a, b) => a.pageNumber - b.pageNumber)
  const sortedRight = [...right].sort((a, b) => a.pageNumber - b.pageNumber)

  return sortedLeft.every((prompt, index) => imagePromptContentEqual(prompt, sortedRight[index]!))
}

export function isImagePromptPageModified(
  prompts: StoryImagePrompt[],
  baseline: StoryImagePrompt[],
  pageNumber: number,
): boolean {
  return !imagePromptContentEqual(
    findImagePromptForPage(prompts, pageNumber),
    findImagePromptForPage(baseline, pageNumber),
  )
}

export function applyImagePromptPatch(
  prompts: StoryImagePrompt[],
  pageNumber: number,
  patch: Partial<StoryImagePrompt>,
): StoryImagePrompt[] {
  const existing = prompts.find((item) => item.pageNumber === pageNumber)

  if (existing) {
    return prompts
      .map((item) => (item.pageNumber === pageNumber ? { ...item, ...patch } : item))
      .sort((left, right) => left.pageNumber - right.pageNumber)
  }

  return [
    ...prompts,
    {
      pageNumber,
      prompt: '',
      continuityReminder: '',
      ...patch,
    },
  ].sort((left, right) => left.pageNumber - right.pageNumber)
}

function promptPreview(prompt: string): string {
  const trimmed = prompt.trim()
  if (!trimmed) return 'No prompt yet'
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed
}

export function imagePromptChipLabel(prompt: StoryImagePrompt): string {
  return promptPreview(prompt.prompt)
}
