import { buildStoryPromptContract } from '../contracts/storyPromptContract'
import { buildStoryPromptMessages } from '../../../prompts'
import {
  parseStoryResponseContract,
  validateGeneratedStory,
} from '../contracts/validation'
import type { StoryResponseContract } from '../contracts/storyResponseContract'
import { seedImagePromptsFromStoryContract } from '../../image-generation/imageGenerationService'
import { throwIfAborted } from '../runtime/generationAbort'
import type { StoryGenerationProvider, StoryGenerationProviderOptions } from '../storyGenerationProvider'
import type {
  GeneratedFlashcardOutput,
  GeneratedImagePromptOutput,
  GeneratedStoryCoreOutput,
  StoryGenerationInput,
} from '../types'

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

interface OpenAiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

interface CachedGeneration {
  inputKey: string
  contract: StoryResponseContract
}

let cachedGeneration: CachedGeneration | null = null

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getOpenAIApiKey(): string {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not configured.')
  }

  return apiKey
}

function getOpenAIModel(): string {
  const model = import.meta.env.VITE_OPENAI_MODEL?.trim()
  return model || DEFAULT_OPENAI_MODEL
}

function inputCacheKey(input: StoryGenerationInput): string {
  return JSON.stringify(input.setup)
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)

  if (fenceMatch) {
    return fenceMatch[1].trim()
  }

  return trimmed
}

function mapStoryCore(contract: StoryResponseContract): GeneratedStoryCoreOutput {
  const storyPages = contract.storyPages.map((page) => ({
    pageNumber: page.pageNumber,
    text: page.text,
    wordCount: page.wordCount > 0 ? page.wordCount : countWords(page.text),
    teachingFocus: page.teachingFocus,
  }))

  const totalWordCount =
    contract.metadata.totalWordCount > 0
      ? contract.metadata.totalWordCount
      : storyPages.reduce((sum, page) => sum + page.wordCount, 0)

  return {
    title: contract.metadata.title,
    summary: contract.metadata.summary,
    storyPages,
    totalWordCount,
    generatedAt: contract.metadata.generatedAt,
  }
}

function mapFlashcards(contract: StoryResponseContract): GeneratedFlashcardOutput[] {
  return contract.flashcards.map((card) => ({
    word: card.word,
    simpleDefinition: card.simpleDefinition,
    exampleSentence: card.exampleSentence,
  }))
}

function mapImagePrompts(contract: StoryResponseContract): GeneratedImagePromptOutput[] {
  return contract.imagePrompts.map((prompt) => ({
    pageNumber: prompt.pageNumber,
    prompt: prompt.prompt,
    continuityReminder: prompt.continuityReminder,
  }))
}

async function requestOpenAiStoryContract(
  input: StoryGenerationInput,
  signal?: AbortSignal,
): Promise<StoryResponseContract> {
  throwIfAborted(signal)

  const apiKey = getOpenAIApiKey()
  const contract = buildStoryPromptContract(input)
  const { system, user } = buildStoryPromptMessages(contract)

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: getOpenAIModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  const payload = (await response.json()) as OpenAiChatCompletionResponse

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI request failed (${response.status}).`)
  }

  const content = payload.choices?.[0]?.message?.content

  if (!content?.trim()) {
    throw new Error('OpenAI returned an empty story response.')
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(extractJsonText(content))
  } catch {
    throw new Error('OpenAI returned invalid JSON for the story response.')
  }

  const validation = validateGeneratedStory(parsed)

  if (!validation.isValid) {
    throw new Error(`OpenAI story response failed validation: ${validation.errors.join('; ')}`)
  }

  const normalized = parseStoryResponseContract(parsed)

  if (!normalized) {
    throw new Error('OpenAI story response could not be normalized.')
  }

  return normalized
}

async function ensureCachedContract(
  input: StoryGenerationInput,
  signal?: AbortSignal,
): Promise<StoryResponseContract> {
  throwIfAborted(signal)

  const inputKey = inputCacheKey(input)

  if (cachedGeneration?.inputKey === inputKey) {
    return cachedGeneration.contract
  }

  const contract = await requestOpenAiStoryContract(input, signal)
  cachedGeneration = { inputKey, contract }
  return contract
}

/** OpenAI-backed story generation provider — isolated; only loaded in AI mode. */
export const openAIStoryGenerationProvider: StoryGenerationProvider = {
  async generateStory(
    input: StoryGenerationInput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedStoryCoreOutput> {
    const contract = await ensureCachedContract(input, options?.signal)
    seedImagePromptsFromStoryContract(mapImagePrompts(contract))
    return mapStoryCore(contract)
  },

  async generateFlashcards(
    input: StoryGenerationInput,
    _story: GeneratedStoryCoreOutput,
    options?: StoryGenerationProviderOptions,
  ): Promise<GeneratedFlashcardOutput[]> {
    const contract = await ensureCachedContract(input, options?.signal)
    return mapFlashcards(contract)
  },
}
