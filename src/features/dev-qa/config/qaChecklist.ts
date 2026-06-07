export interface QaChecklistLink {
  label: string
  to: string
}

export interface QaChecklistItem {
  id: string
  title: string
  description: string
  steps: string[]
  links?: QaChecklistLink[]
}

export const QA_CHECKLIST_ITEMS: QaChecklistItem[] = [
  {
    id: 'create-story',
    title: 'Create story',
    description: 'Start a new story plan from the create flow.',
    steps: [
      'Open Create Story and fill required story basics.',
      'Confirm age range, language, and page count use your settings defaults.',
      'Optional: expand Advanced options for vocabulary or characters.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'save-draft',
    title: 'Save draft',
    description: 'Persist an in-progress story plan before generation.',
    steps: [
      'Fill the create form and click Save plan for later.',
      'Reload the page with the draftId query param still present.',
      'Confirm your plan fields restored correctly.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'generate-story',
    title: 'Generate story',
    description: 'Run generation from the create form and land on a saved story.',
    steps: [
      'Click Generate story on the create form.',
      'Wait for pages, flashcards, and image prompts to generate.',
      'Verify you are redirected to the story detail page after save.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'edit-story',
    title: 'Quick edit story',
    description: 'Change generated story content inline on the detail page.',
    steps: [
      'Open a finished story from Your stories.',
      'Click Quick edit and change page text or a flashcard.',
      'Save changes and confirm the detail view updates with a new version badge.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'advanced-edit-story',
    title: 'Advanced editor',
    description: 'Structural edits and version history restore.',
    steps: [
      'Open a finished story and click Advanced editor.',
      'Add, remove, or reorder a page, then save.',
      'Restore a prior version from Version history and confirm content changes.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'reopen-story-plan',
    title: 'Reopen story plan',
    description: 'Continue a saved setup from the library.',
    steps: [
      'Save a story plan from Create Story.',
      'Open Your stories and click Continue editing on a plan.',
      'Confirm the create form restores your fields.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'duplicate-story',
    title: 'Duplicate story',
    description: 'Create an independent copy from the library.',
    steps: [
      'Open Your stories and duplicate a finished story or plan.',
      'Confirm the copy opens on detail (finished) or create form (plan).',
      'Verify the copy title ends with (Copy) and version resets for finished copies.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'archive-story',
    title: 'Archive story',
    description: 'Hide a story from the default library list without deleting.',
    steps: [
      'Open a story detail page and click Archive story.',
      'Confirm it disappears from the main library list.',
      'Click Show archived on Your stories, then Unarchive story from detail.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'read-story',
    title: 'Read story',
    description: 'Teacher read mode with page navigation.',
    steps: [
      'Open Read Story from a generated story detail page.',
      'Move forward and back through pages.',
      'Confirm page text and layout look correct on mobile width.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Vocabulary cards in story detail and student mode.',
    steps: [
      'Confirm flashcards render on the story detail page.',
      'Open student mode and finish the story to reach the activity menu.',
      'Choose Flashcards and flip through cards.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'image-placeholders',
    title: 'Image placeholders',
    description: 'Page illustration status and generation controls.',
    steps: [
      'Open a generated story with illustration prompts.',
      'Confirm placeholder or ready images show per page.',
      'Try Generate missing and confirm per-page status updates.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'classroom-assignment',
    title: 'Classroom assignment',
    description: 'Assign a story to one or more classrooms.',
    steps: [
      'Create a classroom if none exist.',
      'From story detail, open Assign to classroom.',
      'Save assignments and confirm they appear on story and classroom detail.',
    ],
    links: [
      { label: 'Your stories', to: '/dashboard/stories' },
      { label: 'Classrooms', to: '/dashboard/classrooms' },
    ],
  },
  {
    id: 'student-mode',
    title: 'Student mode',
    description: 'Distraction-free reading route without dashboard chrome.',
    steps: [
      'Copy the student link pattern: /student/story/{storyId}.',
      'Open it in a new tab or incognito window.',
      'Read pages, then verify the post-story activity menu appears.',
    ],
    links: [{ label: 'Your stories', to: '/dashboard/stories' }],
  },
  {
    id: 'storage-status',
    title: 'Storage status',
    description: 'Badge and message for local vs cloud storage.',
    steps: [
      'Check the header badge while signed out (local storage).',
      'Sign in and confirm badge updates when cloud sync is available.',
      'Toggle offline in dev tools and confirm offline messaging.',
    ],
    links: [{ label: 'Settings', to: '/dashboard/settings' }],
  },
  {
    id: 'migration-prompt',
    title: 'Migration prompt',
    description: 'Copy local stories to cloud after sign-in.',
    steps: [
      'Create a story while signed out, then sign in.',
      'Open Settings or Your stories and look for the migration prompt.',
      'Run migration or dismiss and confirm state updates.',
    ],
    links: [
      { label: 'Settings', to: '/dashboard/settings' },
      { label: 'Your stories', to: '/dashboard/stories' },
    ],
  },
]
