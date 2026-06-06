export type StoryReaderTransitionDirection = 1 | -1

export const STORY_READER_TRANSITION_DURATION = 0.24
export const STORY_READER_SWIPE_OFFSET_THRESHOLD = 56
export const STORY_READER_SWIPE_VELOCITY_THRESHOLD = 450
export const STORY_READER_NAVIGATION_LOCK_MS = 320

export const storyReaderSlideVariants = {
  enter: (direction: StoryReaderTransitionDirection) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: StoryReaderTransitionDirection) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
} as const

export const storyReaderReducedMotionVariants = {
  enter: {
    opacity: 1,
    x: 0,
  },
  center: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 1,
    x: 0,
  },
} as const
