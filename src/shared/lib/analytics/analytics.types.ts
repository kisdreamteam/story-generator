/** Supported product events — extend this union when adding new tracked actions. */
export type AnalyticsEventName =
  | 'story_created'
  | 'story_generated'
  | 'draft_saved'
  | 'cloud_sync'
  | 'migration_completed'

export type AnalyticsPropertyValue = string | number | boolean | null

export type AnalyticsEventProperties = Record<string, AnalyticsPropertyValue>

export interface AnalyticsEvent {
  name: AnalyticsEventName
  properties?: AnalyticsEventProperties
  /** ISO timestamp — set automatically by the tracker when omitted. */
  timestamp?: string
}

/** Pluggable backend — swap for PostHog, GA, etc. without changing call sites. */
export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void
}
