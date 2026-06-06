import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { logBoundaryError } from './logBoundaryError'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logBoundaryError('AppErrorBoundary', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
          <div className="w-full max-w-lg">
            <ErrorFallback
              title="Something went wrong"
              description="The app ran into an unexpected problem. You can try again or return home."
              onRetry={this.handleReset}
              backTo="/"
              backLabel="Go home"
            />
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
