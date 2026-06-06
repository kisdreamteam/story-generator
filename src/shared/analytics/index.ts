/** @deprecated Import from `@/shared/lib/analytics` instead. */
export type {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventProperties,
  AnalyticsPropertyValue,
  AnalyticsProvider,
} from '@/shared/lib/analytics'

/** @deprecated Use consoleAnalyticsProvider from `@/shared/lib/analytics`. */
export { consoleAnalyticsProvider as mockAnalyticsProvider } from '@/shared/lib/analytics'

export {
  getAnalyticsProvider,
  resetAnalyticsProvider,
  setAnalyticsProvider,
  trackEvent,
} from '@/shared/lib/analytics'

/** @deprecated Use productAnalytics from `@/shared/lib/analytics`. */
export { productAnalytics as storyAnalytics } from '@/shared/lib/analytics'
