'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary] Caught error:', {
        componentName: this.props.componentName || 'Unknown',
        error: error.message,
        stack: error.stack,
        errorInfo,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-red-50">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 border border-red-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-red-800 mb-2">
                  Component Error
                </h2>
                {this.props.componentName && (
                  <p className="text-sm text-red-700 mb-2">
                    Component: <code className="bg-red-100 px-2 py-1 rounded">{this.props.componentName}</code>
                  </p>
                )}
                <p className="text-sm text-red-700 mb-4 break-words">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                {process.env.NODE_ENV !== 'production' && this.state.error?.stack && (
                  <details className="mt-4">
                    <summary className="text-xs text-red-600 cursor-pointer mb-2">
                      Stack trace (dev only)
                    </summary>
                    <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-64 text-red-800">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    window.location.reload()
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

