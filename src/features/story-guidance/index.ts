/**
 * Teacher guidance — calm, non-blocking suggestions from context and validation.
 */

export {
  TeacherGuidanceKind,
  type BuildTeacherGuidanceInput,
  type BuildTeacherGuidanceResult,
  type TeacherGuidanceSuggestion,
} from './models'
export {
  buildTeacherGuidance,
  buildTeacherGuidanceFromContext,
  buildTeacherGuidanceFromValidation,
} from './lib'
