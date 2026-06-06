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
      'Open Create Story and fill the setup form.',
      'Confirm age range, language, and page count appear correctly.',
      'Continue to review without validation errors.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'save-draft',
    title: 'Save draft',
    description: 'Persist an in-progress story plan before generation.',
    steps: [
      'Edit the setup form and wait for autosave or tap Save draft.',
      'Reload the page with the draftId query param still present.',
      'Confirm your plan fields restored correctly.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'generate-story',
    title: 'Generate story',
    description: 'Run generation from the review step and land on a saved story.',
    steps: [
      'Confirm generation on the review step.',
      'Wait for pages, flashcards, and image prompts to appear.',
      'Verify you are redirected to the story detail page after save.',
    ],
    links: [{ label: 'Create Story', to: '/dashboard/create' }],
  },
  {
    id: 'edit-story',
    title: 'Edit story',
    description: 'Change generated story content and save updates.',
    steps: [
      'Open a generated story and enter edit mode.',
      'Change page text or a flashcard.',
      'Save changes and confirm the detail view updates.',
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
