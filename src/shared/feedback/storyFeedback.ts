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
}
