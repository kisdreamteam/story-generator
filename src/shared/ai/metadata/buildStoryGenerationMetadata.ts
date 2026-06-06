import type { StorySetupInput } from '@/features/stories/types'
import { buildAIStoryInput, buildAIPromptContract } from '../builders'
import { buildStoryPrompt } from '../prompts'
import type {
  BuildStoryGenerationMetadataInput,
  StoryGenerationMetadata,
  StoryGenerationPromptSnapshot,
} from './storyGenerationMetadata.types'

export function buildStoryGenerationMetadata(
  input: BuildStoryGenerationMetadataInput,
): StoryGenerationMetadata {
  return {
    provider: input.provider,
    model: input.model,
    prompt: input.prompt,
    timestamp: input.timestamp ?? new Date().toISOString(),
    generationVersion: input.generationVersion,
  }
}

/** Build prompt strings from teacher setup — no provider calls. */
export function buildStoryGenerationPromptSnapshot(
  setup: StorySetupInput,
): StoryGenerationPromptSnapshot {
  const prompt = buildStoryPrompt(buildAIPromptContract(buildAIStoryInput(setup)))

  return {
    system: prompt.system,
    user: prompt.user,
  }
}

/** Capture full generation metadata from setup and runtime provider details. */
export function buildStoryGenerationMetadataFromSetup(
  setup: StorySetupInput,
  options: Omit<BuildStoryGenerationMetadataInput, 'prompt'>,
): StoryGenerationMetadata {
  return buildStoryGenerationMetadata({
    ...options,
    prompt: buildStoryGenerationPromptSnapshot(setup),
  })
}

function isPromptSnapshot(value: unknown): value is StoryGenerationPromptSnapshot {
  if (!value || typeof value !== 'object') return false

  const prompt = value as StoryGenerationPromptSnapshot

  return typeof prompt.system === 'string' && typeof prompt.user === 'string'
}

/** Safely normalize persisted metadata — returns null when shape is invalid or missing. */
export function normalizeStoryGenerationMetadata(
  value: unknown,
): StoryGenerationMetadata | null {
  if (!value || typeof value !== 'object') return null

  const metadata = value as StoryGenerationMetadata

  if (
    typeof metadata.provider !== 'string' ||
    (metadata.model !== null && typeof metadata.model !== 'string') ||
    !isPromptSnapshot(metadata.prompt) ||
    typeof metadata.timestamp !== 'string' ||
    typeof metadata.generationVersion !== 'string'
  ) {
    return null
  }

  return {
    provider: metadata.provider,
    model: metadata.model,
    prompt: metadata.prompt,
    timestamp: metadata.timestamp,
    generationVersion: metadata.generationVersion,
  }
}

/** Read generation metadata from a story project without throwing. */
export function getStoryGenerationMetadata(
  project: { generationMetadata?: StoryGenerationMetadata | null },
): StoryGenerationMetadata | null {
  return normalizeStoryGenerationMetadata(project.generationMetadata)
}
