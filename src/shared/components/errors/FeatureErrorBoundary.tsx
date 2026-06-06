import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorFallback } from './ErrorFallback'
import { logBoundaryError } from './logBoundaryError'

export interface FeatureErrorBoundaryProps {
  children: ReactNode
  /** Used in console logs to identify the failing area. */
  featureName: string
  title?: string
  description?: string
  /** When this value changes, a prior error state is cleared automatically. */
  resetKey?: string
  backTo?: string
  backLabel?: string
}

interface FeatureErrorBoundaryState {
  hasError: boolean
}

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  state: FeatureErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): FeatureErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logBoundaryError(`FeatureErrorBoundary:${this.props.featureName}`, error, errorInfo)
  }

  componentDidUpdate(prevProps: FeatureErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      prevProps.resetKey !== undefined &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false })
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const {
        title = 'This section ran into a problem',
        description = 'Something unexpected happened here. You can try again or go back to your dashboard.',
        backTo = '/dashboard',
        backLabel = 'Go to dashboard',
      } = this.props

      return (
        <ErrorFallback
          title={title}
          description={description}
          onRetry={this.handleReset}
          backTo={backTo}
          backLabel={backLabel}
        />
      )
    }

    return this.props.children
  }
}

/** Resets the boundary automatically when the route changes. */
export function FeatureRouteBoundary(props: Omit<FeatureErrorBoundaryProps, 'resetKey'>) {
  const location = useLocation()

  return (
    <FeatureErrorBoundary {...props} resetKey={`${location.pathname}${location.search}`} />
  )
}
