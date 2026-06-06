import { toast } from '@/shared/components/toast'

/** Teacher-facing toast presets for common story app actions. */
export const storyFeedback = {
  storySaved(description = 'Your classroom story is saved in Your stories.') {
    toast.success('Story saved', description)
  },

  storyGenerated(description = 'Read it below, then save it to Your stories.') {
    toast.success('Story created', description)
  },

  planSaved(description = 'Open it anytime from Your stories. Generate your full story when you are ready.') {
    toast.success('Story plan saved', description)
  },

  storyUpdated(description = 'Your edits were saved.') {
    toast.success('Changes saved', description)
  },

  storySavedAsCopy(title?: string) {
    const trimmed = title?.trim()
    toast.success(
      'Saved as copy',
      trimmed
        ? `"${trimmed}" was added to Your stories. The original story was not changed.`
        : 'Your edits were saved as a new story. The original was not changed.',
    )
  },

  storyCompleted(title?: string) {
    const trimmed = title?.trim()
    toast.success(
      'Story marked complete',
      trimmed ? `"${trimmed}" is ready for your classroom.` : 'Your story is ready for your classroom.',
    )
  },

  storyDuplicated(title?: string) {
    const trimmed = title?.trim()
    toast.success(
      'Story duplicated',
      trimmed
        ? `"${trimmed}" was added to Your stories. You can edit the copy right away.`
        : 'A copy was added to Your stories. You can edit it right away.',
    )
  },

  migrationCompleted(copied: number) {
    const countLabel = copied === 1 ? '1 story copied' : `${copied} stories copied`
    toast.success('Copied to your account', `${countLabel}. Your browser copies stay here.`)
  },

  migrationPartial(copied: number, failed: number) {
    toast.warning(
      'Some stories could not be copied',
      `${copied} copied, ${failed} still need attention below.`,
    )
  },

  migrationFailed(description = 'Check your connection and try again.') {
    toast.error('Could not copy stories', description)
  },

  generationFailed(description?: string) {
    toast.error(
      'Could not create your story',
      description ?? 'Save your plan and try again later.',
    )
  },

  generationStarted(description = 'Connecting to AI story generation. This may take a moment.') {
    toast.info('Creating your story', description)
  },

  generationSucceededWithFallback(description = 'AI generation was unavailable, so a sample story was used instead.') {
    toast.warning('Sample story created', description)
  },

  imagesGenerated(count: number) {
    const label = count === 1 ? '1 page illustration' : `${count} page illustrations`
    toast.success('Images generated', `${label} ${count === 1 ? 'is' : 'are'} ready. Save to keep them with your story.`)
  },

  imageGenerationFailed(description?: string) {
    toast.error(
      'Could not generate image',
      description ?? 'Try again or edit the illustration prompt for that page.',
    )
  },

  storyClassroomAssignmentsSaved(count: number) {
    const label =
      count === 0
        ? 'Classroom assignments cleared'
        : count === 1
          ? 'Assigned to 1 classroom'
          : `Assigned to ${count} classrooms`
    toast.success('Classroom assignments saved', label)
  },

  storyRemovedFromClassroom(title?: string) {
    const trimmed = title?.trim()
    toast.success(
      'Removed from classroom',
      trimmed
        ? `"${trimmed}" is still in Your stories.`
        : 'The story is still in Your stories.',
    )
  },

  cloudSyncFailed(description?: string) {
    toast.error(
      'Could not save to your account',
      description ?? 'Your work is still here — try saving again.',
    )
  },

  storyDeleted(title?: string) {
    const trimmed = title?.trim()
    toast.success(
      'Story deleted',
      trimmed ? `"${trimmed}" was removed from your library.` : 'The story was removed.',
    )
  },

  deleteFailed(description?: string) {
    toast.error(
      'Could not delete story',
      description ?? 'Try again from Your stories.',
    )
  },

  optimisticRollback(description?: string) {
    toast.warning(
      'Changes reverted',
      description ?? 'Something went wrong while saving. Your previous view was restored.',
    )
  },

  signedIn() {
    toast.success('Signed in', 'New stories will save to your teacher account.')
  },

  accountCreated() {
    toast.success('Account created', 'You are signed in and ready to go.')
  },

  emailConfirmationRequired() {
    toast.info('Check your email', 'Confirm your account, then sign in.')
  },

  templateSaved(name?: string) {
    const trimmed = name?.trim()
    toast.success(
      'Template saved',
      trimmed
        ? `"${trimmed}" is ready to reuse when you create a story.`
        : 'Your template is ready to reuse when you create a story.',
    )
  },

  templateDeleted(name?: string) {
    const trimmed = name?.trim()
    toast.success(
      'Template deleted',
      trimmed ? `"${trimmed}" was removed.` : 'The template was removed.',
    )
  },

  templateApplied(name?: string) {
    const trimmed = name?.trim()
    toast.info(
      'Template applied',
      trimmed
        ? `"${trimmed}" filled your setup form. Edit anything before you continue.`
        : 'Template fields were added to your setup form.',
    )
  },

  storyTextCopied() {
    toast.success('Story text copied', 'Paste it into notes, slides, or a document.')
  },

  storyJsonDownloaded() {
    toast.success('JSON downloaded', 'Your story data was saved as a file.')
  },

  storyExportFailed(description: string) {
    toast.error('Export failed', description)
  },
}
