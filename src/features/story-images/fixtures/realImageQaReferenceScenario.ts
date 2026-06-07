import type { StoryImagePrompt } from '@/features/stories/types'

/**
 * Single-page manual QA scenario for real illustration generation.
 * Use after generating a story with REAL_AI_QA_REFERENCE_SETUP (page 1 kitchen scene).
 *
 * See: docs/domain-6-real-image-qa-checklist.md
 */
export const REAL_IMAGE_QA_REFERENCE_PAGE_NUMBER = 1

export const REAL_IMAGE_QA_REFERENCE_PAGE_TEXT =
  'Nina smiled at Nino. "Let us set the table," she said. Nino picked up a spoon and a bowl.'

export const REAL_IMAGE_QA_REFERENCE_IMAGE_PROMPT: StoryImagePrompt = {
  pageNumber: REAL_IMAGE_QA_REFERENCE_PAGE_NUMBER,
  prompt:
    "Warm watercolor kitchen scene: Nina (older girl in indigo) shows Nino (younger boy in emerald green) how to place a bowl and spoon on a sunny breakfast table.",
  continuityReminder:
    'Nina indigo outfit, Nino emerald green outfit, warm watercolor style, siblings not twins.',
}

/** Pass/fail criteria labels for manual QA logging. */
export const REAL_IMAGE_QA_PASS_FAIL_CRITERIA = [
  'Image depicts a kitchen/table setting matching the page text',
  'Nina appears as the older sister; Nino as the younger brother',
  'Characters are not depicted as twins or same age',
  'Nina wears indigo; Nino wears emerald green',
  'Warm, child-friendly watercolor style',
  'No readable text, signs, logos, captions, or speech bubbles in the artwork',
  'No scary, violent, or inappropriate content',
  'Teacher could use the image on this story page without editing',
] as const

export const REAL_IMAGE_QA_REFERENCE_SUMMARY = {
  pageNumber: REAL_IMAGE_QA_REFERENCE_PAGE_NUMBER,
  promptPreview: REAL_IMAGE_QA_REFERENCE_IMAGE_PROMPT.prompt.slice(0, 80),
} as const
