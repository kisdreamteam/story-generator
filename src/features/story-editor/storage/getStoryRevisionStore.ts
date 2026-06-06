import type { StoryRevisionStore } from '../types/storyRevision.types'
import { localStoryRevisionStore } from './localStoryRevisionStore'

let activeStore: StoryRevisionStore = localStoryRevisionStore

export function getStoryRevisionStore(): StoryRevisionStore {
  return activeStore
}

/** Test hook — swap revision persistence without touching story adapters. */
export function setStoryRevisionStore(store: StoryRevisionStore): void {
  activeStore = store
}

export { localStoryRevisionStore }
