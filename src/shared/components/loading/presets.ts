export const storyGenerationLoadingCopy = {
  title: 'Creating your classroom story…',
  description:
    'We are writing your pages, vocabulary cards, and illustration notes from your plan. This usually takes under a minute — please keep this tab open.',
  statusLabel: 'Generating story',
} as const

export const dashboardLoadingCopy = {
  title: 'Loading your stories',
  description: 'Getting your story plans and finished stories…',
  statusLabel: 'Loading dashboard',
} as const

export const draftLoadingCopy = {
  title: 'Loading your story plan',
  description: 'Getting your saved plan ready — you can edit or generate from here.',
  statusLabel: 'Loading story plan',
} as const

export const migrationLoadingCopy = {
  title: 'Copying stories to your account…',
  description: 'This may take a moment. Copies stay on this device too.',
  statusLabel: 'Migrating stories',
} as const

export const storyDetailLoadingCopy = {
  title: 'Loading story…',
  description: 'Getting your story ready…',
  statusLabel: 'Loading story',
} as const

export const routeChunkLoadingCopy = {
  title: 'Loading page',
  description: 'Getting this section ready…',
  statusLabel: 'Loading page',
} as const

/** @deprecated Use storyGenerationLoadingCopy — kept for existing imports. */
export const storyGenerationLoadingProps = {
  ...storyGenerationLoadingCopy,
  indicator: 'pulse' as const,
}
