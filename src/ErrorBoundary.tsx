import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// A render crash anywhere below this would otherwise leave a blank white screen with no way
// back in — rough for anyone already having a hard day. Reloading re-reads from localStorage,
// so nothing but the current screen's state is lost.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in app:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <div className="error-fallback">
            <p className="error-fallback-title">Something went wrong.</p>
            <p className="error-fallback-body">
              Your progress is saved — reloading should bring everything back.
            </p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
