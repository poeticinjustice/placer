import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import './ErrorBoundary.css'

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (or error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              <ExclamationTriangleIcon />
            </div>

            <h1 className="error-boundary__title">
              Oops! Something went wrong
            </h1>

            <p className="error-boundary__message">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>

            <div className="error-boundary__actions">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary"
              >
                Go to Home
              </button>
            </div>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary__error-info">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary