/** Teacher-facing template categories. */
export type TeacherTemplateCategory = 'field-trip' | 'phonics' | 'roleplay' | 'sel' | 'custom'

/** Generation and classroom preferences — separate from story content fields. */
export interface TeacherTemplatePreferences {
  storyPurpose: string
  storyTone: string
  ageRange: string
  language: string
  pageCount: number
}

/** Vocabulary and lesson targets teachers reuse across stories. */
export interface TeacherTemplateVocabularyTargets {
  lessonGoal: string
  vocabularyFocus: string
  wordsToInclude: string
  wordsToAvoid: string
}

/** Reusable setup fields — theme, setting, plot, cast, notes. */
export interface TeacherTemplateSetupFields {
  theme: string
  setting: string
  mainEvents: string
  characters: string
  notes: string
}

/** Saved teacher template — isolated from story projects. */
export interface TeacherTemplate {
  id: string
  name: string
  description: string
  category: TeacherTemplateCategory
  preferences: TeacherTemplatePreferences
  vocabularyTargets: TeacherTemplateVocabularyTargets
  setupFields: TeacherTemplateSetupFields
  /** Built-in presets ship with the app and cannot be deleted. */
  isBuiltIn?: boolean
  createdAt: string
  updatedAt: string
}

/** List row without full payload — used in pickers. */
export interface TeacherTemplateSummary {
  id: string
  name: string
  description: string
  category: TeacherTemplateCategory
  isBuiltIn: boolean
  updatedAt: string
  formattedUpdatedAt: string
}

/** Cap on teacher-created templates — built-ins are excluded. */
export const DEFAULT_TEACHER_TEMPLATE_LIMIT = 25

/** Persistence boundary — local and cloud adapters implement this contract. */
export interface TeacherTemplateStore {
  list(): Promise<TeacherTemplate[]>
  get(id: string): Promise<TeacherTemplate | null>
  save(template: TeacherTemplate): Promise<void>
  delete(id: string): Promise<void>
}
