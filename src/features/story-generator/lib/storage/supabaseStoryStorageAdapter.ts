import type { PostgrestError } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/shared/lib/supabase/supabaseClient'
import { ensureProfileRow } from '@/shared/lib/supabase/ensureProfileRow'
import {
  clearStoryIdMappings,
  getLocalCloudMigrationEntry,
} from '../migration/localStoryMigrationMap'
import type {
  GeneratedStory,
  StoryFlashcard,
  StoryImagePrompt,
  StoryPage,
  StoryProject,
  StorySetupInput,
  StoryGenerationMetadata,
} from '../../types/story-generator.types'
import type { StoryPlanReview } from '@/features/stories/types'
import { normalizeStoryGenerationMetadata } from '@/shared/ai/metadata'
import { mergeImagePromptRowsIntoStoryPages, normalizeGeneratedStoryPageImages } from '@/features/story-images/lib/normalizeStoryPageImage'
import { generatedStoryFromProject, hasGeneratedStoryContent } from '../story-project'
import { mergeGeneratedStoryUpdate } from './mergeStoryUpdate'
import type { StoryLifecycleStatus } from '@/features/stories/types/storyLifecycle.types'
import { toSupabaseProjectStatus } from '@/features/stories/utils/storyLifecycleStatus'
import type { LoadDraftWithGeneratedStoryResult, StoryStorageAdapterAsync } from './StoryStorageAdapter'

/**
 * Supabase-backed story persistence — active when resolveStoryStorageAdapter() selects it.
 *
 * Requires a signed-in user and rows in `profiles` (upserted on save if missing).
 * Local draft ids like `draft-*` map to stable cloud UUIDs via sessionStorage for repeat saves.
 */

// --- Database row shapes (private) ---

interface StoryProjectRow {
  id: string
  owner_id: string
  title: string
  status: string
  setup_data: SetupDataJson
  generated_metadata: GeneratedMetadataJson
  language: string
  age_range: string
  theme: string
  page_count: number
  created_at: string
  updated_at: string
}

interface StoryPageRow {
  id: string
  project_id: string
  page_number: number
  text: string
  word_count: number
  notes: string | null
}

interface StoryFlashcardRow {
  id: string
  project_id: string
  page_id: string | null
  word: string
  definition: string | null
  example_sentence: string | null
  sort_order: number
}

interface StoryImagePromptRow {
  id: string
  project_id: string
  page_id: string | null
  page_number: number
  prompt_text: string
  continuity_reminder: string | null
  image_url: string | null
  status: string
}

interface SetupDataJson {
  setup?: StorySetupInput | null
  planReview?: StoryPlanReview | null
  lessonGoal?: string
  vocabularyWords?: string[]
  setting?: string
  characters?: string
}

interface GeneratedMetadataJson {
  generatedStory?: GeneratedStory
  generationMetadata?: StoryGenerationMetadata
  title?: string
  summary?: string
  totalWordCount?: number
  generatedAt?: string
  contentVersion?: number
  lifecycleStatus?: StoryLifecycleStatus
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const CLOUD_ID_MAP_PREFIX = 'story-cloud-id:'

function throwSupabaseError(context: string, error: PostgrestError): never {
  throw new Error(`${context}: ${error.message}${error.code ? ` (${error.code})` : ''}`)
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Resolve a route or draft id to the cloud UUID when one exists locally. */
function resolveCloudProjectId(id: string): string {
  if (isUuid(id)) return id

  try {
    if (typeof sessionStorage !== 'undefined') {
      const storageKey = `${CLOUD_ID_MAP_PREFIX}${id}`
      const mapped = sessionStorage.getItem(storageKey)
      if (mapped && isUuid(mapped)) return mapped
    }
  } catch {
    // sessionStorage unavailable — fall through.
  }

  const migrationEntry = getLocalCloudMigrationEntry(id)
  if (migrationEntry?.cloudId && isUuid(migrationEntry.cloudId)) {
    return migrationEntry.cloudId
  }

  return id
}

/** Map local draft ids (e.g. draft-*) to a stable cloud UUID for repeat saves in this browser. */
function resolveProjectId(project: StoryProject): string {
  if (isUuid(project.id)) return project.id

  const mappedId = resolveCloudProjectId(project.id)
  if (isUuid(mappedId)) return mappedId

  try {
    if (typeof sessionStorage !== 'undefined') {
      const storageKey = `${CLOUD_ID_MAP_PREFIX}${project.id}`
      const cloudId = crypto.randomUUID()
      sessionStorage.setItem(storageKey, cloudId)
      return cloudId
    }
  } catch {
    // sessionStorage unavailable — fall through.
  }

  return crypto.randomUUID()
}

function projectStatus(project: StoryProject): 'draft' | 'generated' | 'saved' | 'archived' {
  return toSupabaseProjectStatus(project)
}

function toSetupDataJson(project: StoryProject): SetupDataJson {
  return {
    setup: project.setup ?? null,
    planReview: project.planReview ?? null,
    lessonGoal: project.lessonGoal,
    vocabularyWords: project.vocabularyWords,
    setting: project.setting,
    characters: project.characters,
  }
}

function toGeneratedMetadataJson(project: StoryProject): GeneratedMetadataJson {
  if (project.generatedStory) {
    return {
      generatedStory: project.generatedStory,
      generationMetadata: project.generationMetadata,
      contentVersion: project.version,
      lifecycleStatus: project.lifecycleStatus,
    }
  }

  if (!hasGeneratedStoryContent(project)) {
    return {}
  }

  const totalWordCount = project.storyPages.reduce((sum, page) => sum + page.wordCount, 0)

  return {
    title: project.title,
    summary: project.lessonGoal || project.theme,
    totalWordCount,
    generatedAt: project.updatedAt,
  }
}

function pagesFromProject(project: StoryProject): StoryPage[] {
  if (project.generatedStory?.storyPages.length) {
    return project.generatedStory.storyPages
  }

  return project.storyPages
}

function flashcardsFromProject(project: StoryProject): StoryFlashcard[] {
  if (project.generatedStory?.flashcards.length) {
    return project.generatedStory.flashcards
  }

  return project.flashcards
}

function imagePromptsFromProject(project: StoryProject): StoryImagePrompt[] {
  if (project.generatedStory?.imagePrompts.length) {
    return project.generatedStory.imagePrompts
  }

  return project.imagePrompts
}

function toStoryProjectRow(project: StoryProject, ownerId: string): StoryProjectRow {
  const now = new Date().toISOString()

  return {
    id: resolveProjectId(project),
    owner_id: ownerId,
    title: project.title || 'Untitled story',
    status: projectStatus(project),
    setup_data: toSetupDataJson(project),
    generated_metadata: toGeneratedMetadataJson(project),
    language: project.language ?? '',
    age_range: project.ageRange ?? '',
    theme: project.theme ?? '',
    page_count: project.pageCount ?? 0,
    created_at: project.createdAt || now,
    updated_at: now,
  }
}

function mapPageRow(row: StoryPageRow): StoryPage {
  return {
    pageNumber: row.page_number,
    text: row.text,
    wordCount: row.word_count,
    teachingFocus: row.notes ?? '',
  }
}

function mapFlashcardRow(row: StoryFlashcardRow): StoryFlashcard {
  return {
    word: row.word,
    simpleDefinition: row.definition ?? '',
    exampleSentence: row.example_sentence ?? '',
  }
}

function mapImagePromptRow(row: StoryImagePromptRow): StoryImagePrompt {
  return {
    pageNumber: row.page_number,
    prompt: row.prompt_text,
    continuityReminder: row.continuity_reminder ?? '',
  }
}

function buildStoryProjectFromRows(
  row: StoryProjectRow,
  pages: StoryPageRow[],
  flashcards: StoryFlashcardRow[],
  imagePrompts: StoryImagePromptRow[],
): StoryProject {
  const setupData = row.setup_data ?? {}
  const generatedMeta = row.generated_metadata ?? {}

  const storyPages = mergeImagePromptRowsIntoStoryPages(
    [...pages]
      .sort((a, b) => a.page_number - b.page_number)
      .map(mapPageRow),
    imagePrompts,
  )

  const mappedFlashcards = [...flashcards]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapFlashcardRow)

  const mappedImagePrompts = [...imagePrompts]
    .sort((a, b) => a.page_number - b.page_number)
    .map(mapImagePromptRow)

  let generatedStory: GeneratedStory | undefined = generatedMeta.generatedStory
    ? normalizeGeneratedStoryPageImages(generatedMeta.generatedStory)
    : undefined

  if (!generatedStory && storyPages.length > 0) {
    generatedStory = {
      title: generatedMeta.title ?? row.title,
      summary: generatedMeta.summary ?? setupData.lessonGoal ?? row.theme,
      storyPages,
      flashcards: mappedFlashcards,
      imagePrompts: mappedImagePrompts,
      totalWordCount:
        generatedMeta.totalWordCount ??
        storyPages.reduce((sum, page) => sum + page.wordCount, 0),
      generatedAt: generatedMeta.generatedAt ?? row.updated_at,
    }
  }

  return {
    id: row.id,
    title: row.title,
    theme: row.theme,
    ageRange: row.age_range,
    language: row.language,
    pageCount: row.page_count,
    lessonGoal: setupData.lessonGoal ?? '',
    vocabularyWords: setupData.vocabularyWords ?? [],
    setting: setupData.setting ?? '',
    characters: setupData.characters ?? '',
    storyPages,
    flashcards: mappedFlashcards,
    imagePrompts: mappedImagePrompts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: generatedMeta.contentVersion,
    lifecycleStatus: generatedMeta.lifecycleStatus,
    setup: setupData.setup ?? undefined,
    planReview: setupData.planReview ?? undefined,
    generatedStory,
    generationMetadata: normalizeStoryGenerationMetadata(generatedMeta.generationMetadata) ?? undefined,
  }
}

async function requireUserId(): Promise<string> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`Supabase auth failed while accessing story storage: ${error.message}`)
  }

  if (!user) {
    throw new Error(
      'Supabase story storage requires a signed-in user. Sign in before reading or saving stories.',
    )
  }

  return user.id
}

async function loadChildRows(projectId: string): Promise<{
  pages: StoryPageRow[]
  flashcards: StoryFlashcardRow[]
  imagePrompts: StoryImagePromptRow[]
}> {
  const supabase = getSupabaseClient()

  const [pagesResult, flashcardsResult, promptsResult] = await Promise.all([
    supabase.from('story_pages').select('*').eq('project_id', projectId).order('page_number'),
    supabase.from('story_flashcards').select('*').eq('project_id', projectId).order('sort_order'),
    supabase
      .from('story_image_prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('page_number'),
  ])

  if (pagesResult.error) {
    throwSupabaseError(`Failed to load story pages for project ${projectId}`, pagesResult.error)
  }

  if (flashcardsResult.error) {
    throwSupabaseError(
      `Failed to load story flashcards for project ${projectId}`,
      flashcardsResult.error,
    )
  }

  if (promptsResult.error) {
    throwSupabaseError(
      `Failed to load story image prompts for project ${projectId}`,
      promptsResult.error,
    )
  }

  return {
    pages: (pagesResult.data ?? []) as StoryPageRow[],
    flashcards: (flashcardsResult.data ?? []) as StoryFlashcardRow[],
    imagePrompts: (promptsResult.data ?? []) as StoryImagePromptRow[],
  }
}

async function replaceChildRows(projectId: string, project: StoryProject): Promise<void> {
  const supabase = getSupabaseClient()
  const pages = pagesFromProject(project)
  const flashcards = flashcardsFromProject(project)
  const imagePrompts = imagePromptsFromProject(project)

  const deletePages = await supabase.from('story_pages').delete().eq('project_id', projectId)
  if (deletePages.error) {
    throwSupabaseError(`Failed to clear story pages for project ${projectId}`, deletePages.error)
  }

  const deleteFlashcards = await supabase
    .from('story_flashcards')
    .delete()
    .eq('project_id', projectId)
  if (deleteFlashcards.error) {
    throwSupabaseError(
      `Failed to clear story flashcards for project ${projectId}`,
      deleteFlashcards.error,
    )
  }

  const deletePrompts = await supabase
    .from('story_image_prompts')
    .delete()
    .eq('project_id', projectId)
  if (deletePrompts.error) {
    throwSupabaseError(
      `Failed to clear story image prompts for project ${projectId}`,
      deletePrompts.error,
    )
  }

  if (pages.length === 0 && flashcards.length === 0 && imagePrompts.length === 0) {
    return
  }

  const pageIdByNumber = new Map<number, string>()

  if (pages.length > 0) {
    const pageRows = pages.map((page) => {
      const id = crypto.randomUUID()
      pageIdByNumber.set(page.pageNumber, id)

      return {
        id,
        project_id: projectId,
        page_number: page.pageNumber,
        text: page.text,
        word_count: page.wordCount,
        notes: page.teachingFocus || null,
      }
    })

    const insertPages = await supabase.from('story_pages').insert(pageRows)
    if (insertPages.error) {
      throwSupabaseError(`Failed to save story pages for project ${projectId}`, insertPages.error)
    }
  }

  if (flashcards.length > 0) {
    const flashcardRows = flashcards.map((card, index) => ({
      id: crypto.randomUUID(),
      project_id: projectId,
      page_id: null as string | null,
      word: card.word,
      definition: card.simpleDefinition || null,
      example_sentence: card.exampleSentence || null,
      sort_order: index,
    }))

    const insertFlashcards = await supabase.from('story_flashcards').insert(flashcardRows)
    if (insertFlashcards.error) {
      throwSupabaseError(
        `Failed to save story flashcards for project ${projectId}`,
        insertFlashcards.error,
      )
    }
  }

  if (imagePrompts.length > 0) {
    const promptRows = imagePrompts.map((prompt) => ({
      id: crypto.randomUUID(),
      project_id: projectId,
      page_id: pageIdByNumber.get(prompt.pageNumber) ?? null,
      page_number: prompt.pageNumber,
      prompt_text: prompt.prompt,
      continuity_reminder: prompt.continuityReminder || null,
      image_url: null,
      status: 'prompt_only' as const,
    }))

    const insertPrompts = await supabase.from('story_image_prompts').insert(promptRows)
    if (insertPrompts.error) {
      throwSupabaseError(
        `Failed to save story image prompts for project ${projectId}`,
        insertPrompts.error,
      )
    }
  }
}

async function loadStoryProjectById(id: string): Promise<StoryProject | null> {
  if (!id) return null

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('story_projects').select('*').eq('id', id).maybeSingle()

  if (error) {
    throwSupabaseError(`Failed to load story project ${id}`, error)
  }

  if (!data) return null

  const row = data as StoryProjectRow
  const children = await loadChildRows(row.id)

  return buildStoryProjectFromRows(row, children.pages, children.flashcards, children.imagePrompts)
}

export const supabaseStoryStorageAdapter: StoryStorageAdapterAsync = {
  async getStoryDraft(id: string): Promise<StoryProject | null> {
    await requireUserId()
    return loadStoryProjectById(id)
  },

  async getStoryDrafts(): Promise<StoryProject[]> {
    const userId = await requireUserId()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('story_projects')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throwSupabaseError('Failed to load story projects list', error)
    }

    const rows = (data ?? []) as StoryProjectRow[]
    if (rows.length === 0) return []

    const projectIds = rows.map((row) => row.id)

    const [pagesResult, flashcardsResult, promptsResult] = await Promise.all([
      supabase.from('story_pages').select('*').in('project_id', projectIds),
      supabase.from('story_flashcards').select('*').in('project_id', projectIds),
      supabase.from('story_image_prompts').select('*').in('project_id', projectIds),
    ])

    if (pagesResult.error) {
      throwSupabaseError('Failed to load story pages for project list', pagesResult.error)
    }

    if (flashcardsResult.error) {
      throwSupabaseError('Failed to load story flashcards for project list', flashcardsResult.error)
    }

    if (promptsResult.error) {
      throwSupabaseError(
        'Failed to load story image prompts for project list',
        promptsResult.error,
      )
    }

    const pagesByProject = groupBy((pagesResult.data ?? []) as StoryPageRow[], 'project_id')
    const flashcardsByProject = groupBy(
      (flashcardsResult.data ?? []) as StoryFlashcardRow[],
      'project_id',
    )
    const promptsByProject = groupBy(
      (promptsResult.data ?? []) as StoryImagePromptRow[],
      'project_id',
    )

    return rows.map((row) =>
      buildStoryProjectFromRows(
        row,
        pagesByProject.get(row.id) ?? [],
        flashcardsByProject.get(row.id) ?? [],
        promptsByProject.get(row.id) ?? [],
      ),
    )
  },

  async saveStoryDraft(project: StoryProject): Promise<StoryProject> {
    if (!project.id) {
      throw new Error('Cannot save story project without an id.')
    }

    const userId = await requireUserId()
    const supabase = getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await ensureProfileRow(user)
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to ensure teacher profile row before saving story',
        )
      }
    }

    const row = toStoryProjectRow(project, userId)

    const { error } = await supabase.from('story_projects').upsert(row, { onConflict: 'id' })

    if (error) {
      throwSupabaseError(`Failed to save story project ${row.id}`, error)
    }

    await replaceChildRows(row.id, project)

    return {
      ...project,
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  async updateStory(id: string, generatedStory: GeneratedStory): Promise<StoryProject> {
    if (!id) {
      throw new Error('Cannot update story without an id.')
    }

    await requireUserId()
    const existing = await loadStoryProjectById(id)

    if (!existing) {
      throw new Error(`Story not found: ${id}`)
    }

    const updated = mergeGeneratedStoryUpdate(existing, generatedStory)
    return supabaseStoryStorageAdapter.saveStoryDraft(updated)
  },

  async deleteStoryDraft(id: string): Promise<void> {
    if (!id) {
      throw new Error('Cannot delete story without an id.')
    }

    await requireUserId()
    const supabase = getSupabaseClient()
    const projectId = resolveCloudProjectId(id)
    const existing = await loadStoryProjectById(projectId)

    if (!existing) {
      throw new Error(`Story not found: ${id}`)
    }

    const { error } = await supabase.from('story_projects').delete().eq('id', projectId)

    if (error) {
      throwSupabaseError(`Failed to delete story project ${id}`, error)
    }

    if (!isUuid(id)) {
      clearStoryIdMappings(id)
    }
  },

  async clearStoryDrafts(): Promise<void> {
    const userId = await requireUserId()
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('story_projects').delete().eq('owner_id', userId)

    if (error) {
      throwSupabaseError('Failed to clear story projects for current user', error)
    }
  },

  async loadDraftWithGeneratedStory(id: string): Promise<LoadDraftWithGeneratedStoryResult | null> {
    await requireUserId()
    const draft = await loadStoryProjectById(id)
    if (!draft) return null

    const generatedStory = generatedStoryFromProject(draft)
    if (!generatedStory) return null

    return { draft, generatedStory }
  },
}

function groupBy<T>(items: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const groupKey = String(item[key])
    const bucket = map.get(groupKey)

    if (bucket) {
      bucket.push(item)
    } else {
      map.set(groupKey, [item])
    }
  }

  return map
}
