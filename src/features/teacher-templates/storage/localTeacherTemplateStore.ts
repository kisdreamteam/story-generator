import type { TeacherTemplate, TeacherTemplateStore } from '../types/teacherTemplate.types'
import { normalizeTeacherTemplate, trimCustomTemplates } from '../lib/teacherTemplateUtils'

export const TEACHER_TEMPLATE_STORAGE_KEY = 'teacher-templates'

function readTemplates(storageKey: string): TeacherTemplate[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(storageKey)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeTeacherTemplate(item as TeacherTemplate))
      .filter((item): item is TeacherTemplate => Boolean(item && !item.isBuiltIn))
  } catch {
    return []
  }
}

function writeTemplates(storageKey: string, templates: TeacherTemplate[]): void {
  try {
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(storageKey, JSON.stringify(trimCustomTemplates(templates)))
  } catch {
    // Template saves are best-effort and must not block story creation.
  }
}

function createLocalTeacherTemplateStore(storageKey: string): TeacherTemplateStore {
  return {
    async list(): Promise<TeacherTemplate[]> {
      return readTemplates(storageKey)
    },

    async get(id: string): Promise<TeacherTemplate | null> {
      if (!id) return null
      return readTemplates(storageKey).find((template) => template.id === id) ?? null
    },

    async save(template: TeacherTemplate): Promise<void> {
      if (!template.id || template.isBuiltIn) return

      const normalized = normalizeTeacherTemplate(template)
      if (!normalized) return

      const templates = readTemplates(storageKey).filter((item) => item.id !== normalized.id)
      writeTemplates(storageKey, [normalized, ...templates])
    },

    async delete(id: string): Promise<void> {
      if (!id) return

      const templates = readTemplates(storageKey).filter((template) => template.id !== id)
      writeTemplates(storageKey, templates)
    },
  }
}

export const localTeacherTemplateStore = createLocalTeacherTemplateStore(TEACHER_TEMPLATE_STORAGE_KEY)

export function createCloudTeacherTemplateStore(userId: string): TeacherTemplateStore {
  return createLocalTeacherTemplateStore(`${TEACHER_TEMPLATE_STORAGE_KEY}-${userId}`)
}
