export {
  createTeacherTemplateFromFormValues,
  deleteTeacherTemplate,
  getTeacherTemplate,
  listTeacherTemplateSummaries,
  listTeacherTemplates,
  saveTeacherTemplate,
} from './api/teacherTemplateApi'

export { TeacherTemplatePanel, TemplateCreator, TemplatePicker } from './components'
export type {
  TeacherTemplatePanelProps,
  TemplateCreatorProps,
  TemplatePickerProps,
} from './components'

export { useTeacherTemplates, prefetchTeacherTemplateSummaries } from './hooks'
export type { UseTeacherTemplatesResult } from './hooks'

export {
  BUILT_IN_TEACHER_TEMPLATE_IDS,
  builtInTeacherTemplates,
  getBuiltInTeacherTemplate,
} from './lib/builtInTeacherTemplates'

export {
  buildTeacherTemplate,
  createTeacherTemplateId,
  formValuesToTeacherTemplatePayload,
  getTeacherTemplateCategoryLabel,
  storySetupInputToTeacherTemplatePayload,
  teacherTemplateToFormValues,
  teacherTemplateToStorySetupInput,
  toTeacherTemplateSummary,
  trimCustomTemplates,
} from './lib/teacherTemplateUtils'

export { formatTeacherTemplateTimestamp } from './lib/teacherTemplateFormat'

export {
  getTeacherTemplateStore,
  localTeacherTemplateStore,
  resolveTeacherTemplateStore,
  setTeacherTemplateStore,
} from './storage/resolveTeacherTemplateStore'

export {
  createCloudTeacherTemplateStore,
  TEACHER_TEMPLATE_STORAGE_KEY,
} from './storage/localTeacherTemplateStore'

export type {
  TeacherTemplate,
  TeacherTemplateCategory,
  TeacherTemplatePreferences,
  TeacherTemplateSetupFields,
  TeacherTemplateStore,
  TeacherTemplateSummary,
  TeacherTemplateVocabularyTargets,
} from './types/teacherTemplate.types'

export { DEFAULT_TEACHER_TEMPLATE_LIMIT } from './types/teacherTemplate.types'
