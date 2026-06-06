import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  STORY_READER_SWIPE_OFFSET_THRESHOLD,
  STORY_READER_SWIPE_VELOCITY_THRESHOLD,
  STORY_READER_TRANSITION_DURATION,
  storyReaderReducedMotionVariants,
  storyReaderSlideVariants,
  type StoryReaderTransitionDirection,
} from '../lib/storyReaderMotion'

interface StoryReaderSlideTransitionProps {
  slideKey: string
  direction: StoryReaderTransitionDirection
  canGoNext: boolean
  canGoPrevious: boolean
  onSwipeNext: () => void
  onSwipePrevious: () => void
  onTransitionComplete?: () => void
  swipeEnabled?: boolean
  children: ReactNode
}

export function StoryReaderSlideTransition({
  slideKey,
  direction,
  canGoNext,
  canGoPrevious,
  onSwipeNext,
  onSwipePrevious,
  onTransitionComplete,
  swipeEnabled = true,
  children,
}: StoryReaderSlideTransitionProps) {
  const reducedMotion = useReducedMotion()

  const variants = reducedMotion ? storyReaderReducedMotionVariants : storyReaderSlideVariants
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: STORY_READER_TRANSITION_DURATION, ease: 'easeOut' as const }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reducedMotion) {
      return
    }

    const swipedLeft =
      info.offset.x <= -STORY_READER_SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x <= -STORY_READER_SWIPE_VELOCITY_THRESHOLD
    const swipedRight =
      info.offset.x >= STORY_READER_SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x >= STORY_READER_SWIPE_VELOCITY_THRESHOLD

    if (swipedLeft && canGoNext) {
      onSwipeNext()
    } else if (swipedRight && canGoPrevious) {
      onSwipePrevious()
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={slideKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          drag={reducedMotion || !swipeEnabled ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          onAnimationComplete={onTransitionComplete}
          className="w-full touch-pan-y"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
