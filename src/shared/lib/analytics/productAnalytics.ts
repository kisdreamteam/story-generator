import { trackEvent } from './analyticsClient'

/** Typed helpers for story-domain events — keeps property names consistent. */
export const productAnalytics = {
  storyCreated(properties: {
    storyId: string
    pageCount: number
    totalWordCount?: number
    source?: 'create_flow' | 'migration' | 'duplicate'
  }): void {
    trackEvent('story_created', properties)
  },

  storyGenerated(properties: {
    pageCount: number
    totalWordCount: number
    source?: 'create_flow' | 'retry'
    provider?: string | null
  }): void {
    trackEvent('story_generated', properties)
  },

  draftSaved(properties: {
    storyId: string
    pageCount?: number
    source?: 'create_flow' | 'autosave' | 'manual'
  }): void {
    trackEvent('draft_saved', properties)
  },

  cloudSync(properties: {
    label: string
    outcome: 'success' | 'queued'
    destination?: 'cloud' | 'local'
  }): void {
    trackEvent('cloud_sync', properties)
  },

  migrationCompleted(properties: {
    copied: number
    skipped: number
    failed: number
  }): void {
    trackEvent('migration_completed', properties)
  },
}
