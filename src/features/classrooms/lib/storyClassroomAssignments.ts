import {
  localStoryClassroomAssignmentStorage,
  STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY,
} from '../storage/localStoryClassroomAssignmentStorage'

export { STORY_CLASSROOM_ASSIGNMENTS_STORAGE_KEY }

export async function listClassroomIdsForStory(storyId: string): Promise<string[]> {
  return localStoryClassroomAssignmentStorage.listClassroomIdsForStory(storyId)
}

export async function listStoryIdsForClassroom(classroomId: string): Promise<string[]> {
  return localStoryClassroomAssignmentStorage.listStoryIdsForClassroom(classroomId)
}

export async function setStoryClassroomAssignments(
  storyId: string,
  classroomIds: string[],
): Promise<void> {
  localStoryClassroomAssignmentStorage.setStoryClassroomAssignments(storyId, classroomIds)
}

export async function removeStoryClassroomAssignments(storyId: string): Promise<void> {
  localStoryClassroomAssignmentStorage.removeAssignmentsForStory(storyId)
}

export async function removeClassroomStoryAssignments(classroomId: string): Promise<void> {
  localStoryClassroomAssignmentStorage.removeAssignmentsForClassroom(classroomId)
}

export async function unassignStoryFromClassroom(
  storyId: string,
  classroomId: string,
): Promise<void> {
  localStoryClassroomAssignmentStorage.unassignStoryFromClassroom(storyId, classroomId)
}

export async function clearStoryClassroomAssignments(): Promise<void> {
  localStoryClassroomAssignmentStorage.clearAssignments()
}
