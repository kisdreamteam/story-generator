import type { ErrorInfo } from 'react'

export function logBoundaryError(scope: string, error: Error, errorInfo: ErrorInfo): void {
  console.error(`[${scope}]`, error)
  console.error(`[${scope}] Component stack:`, errorInfo.componentStack)
}
