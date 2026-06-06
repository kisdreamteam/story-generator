import type { AnalyticsEvent, AnalyticsProvider } from './analytics.types'

/**
 * Default provider — logs structured events to the console.
 * Replace via setAnalyticsProvider() when a real vendor is ready.
 */
export const consoleAnalyticsProvider: AnalyticsProvider = {
  track(event: AnalyticsEvent): void {
    const payload = {
      name: event.name,
      properties: event.properties ?? {},
      timestamp: event.timestamp ?? new Date().toISOString(),
    }

    console.info('[analytics]', payload)
  },
}
