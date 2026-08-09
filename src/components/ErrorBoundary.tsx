import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

/**
 * Catches render errors and shows a human-readable recovery UI
 * (no raw stack traces to end users).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message:
        error?.message?.slice(0, 200) ||
        'Something went wrong while rendering the app.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep console for developers; UI stays friendly
    console.error('CARD//OS render error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mesh-bg flex min-h-full items-center justify-center p-6">
          <div className="glass-strong max-w-md rounded-2xl p-6 panel-glow">
            <p className="font-display text-lg font-semibold text-text-primary">
              CARD//OS hit a display error
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Your local data is usually still safe. Try reloading. If this keeps
              happening, export a backup from Settings (if the page loads) or clear
              site data for this origin.
            </p>
            <p className="mt-3 rounded-lg bg-surface-0 px-3 py-2 text-xs text-text-muted">
              {this.state.message}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => window.location.reload()}>
                Reload app
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  this.setState({ hasError: false, message: '' })
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
