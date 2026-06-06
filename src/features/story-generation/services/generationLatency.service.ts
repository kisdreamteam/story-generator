import { getAiConfig } from './aiConfig.service'

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 800

/**
 * Simulates AI generation latency for mock and fixture paths.
 * Remove or bypass when a real backend provider is connected.
 */
export async function simulateGenerationLatency(): Promise<void> {
  const delayMs =
    MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1))

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** True for mock mode and fixture mode — skip when real backend AI succeeds. */
export function shouldSimulateGenerationLatency(): boolean {
  const config = getAiConfig()
  if (!config.enabled) return true
  if (config.fixtureMode) return true
  return false
}
