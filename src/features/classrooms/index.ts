/**
 * Classrooms feature — teacher class organization with local storage first.
 */

export * from './types'
export * from './storage'
export * from './api'
export * from './hooks'
export * from './components'
export { ClassroomsPage, ClassroomDetailPage } from './pages'
export {
  clearClassrooms,
  createClassroom,
  deleteClassroom,
  getClassroom,
  getClassrooms,
  saveClassroom,
} from './lib/classroom-storage'
export {
  clearStoryClassroomAssignments,
  listClassroomIdsForStory,
  listStoryIdsForClassroom,
  removeClassroomStoryAssignments,
  removeStoryClassroomAssignments,
  setStoryClassroomAssignments,
  unassignStoryFromClassroom,
} from './lib/storyClassroomAssignments'
export {
  classroomStoryLibraryCountLabel,
  EMPTY_CLASSROOM_STORY_LIBRARY_FILTERS,
  filterClassroomAssignedStories,
  hasActiveClassroomStoryLibraryFilters,
} from './lib/classroomStoryLibraryFilters'
export { confirmRemoveStoryFromClassroom } from './lib/confirmRemoveStoryFromClassroom'
export {
  classroomCountLabel,
  formatClassroomDate,
  getClassroomAgeRangeLabel,
  getClassroomLanguageLabel,
} from './lib/classroomFormat'
export {
  classifyClassroomLoadError,
  classroomNotFoundPresentation,
  invalidClassroomIdPresentation,
  isValidClassroomRouteId,
} from './lib/classroomRouteGuards'
