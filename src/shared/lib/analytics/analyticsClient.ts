import type { AnalyticsEventName, AnalyticsEventProperties, AnalyticsProvider } from './analytics.types'
import { consoleAnalyticsProvider } from './consoleAnalyticsProvider'

let activeProvider: AnalyticsProvider = consoleAnalyticsProvider

/** Replace the active analytics backend (e.g. PostHog) at app bootstrap. */
export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider
}

export function getAnalyticsProvider(): AnalyticsProvider {
  return activeProvider
}

/** Reset to the console logger — useful in tests. */
export function resetAnalyticsProvider(): void {
  activeProvider = consoleAnalyticsProvider
}

/** Central tracking entry point — all product events flow through here. */
export function trackEvent(name: AnalyticsEventName, properties?: AnalyticsEventProperties): void {
  activeProvider.track({
    name,
    properties,
    timestamp: new Date().toISOString(),
  })
}
