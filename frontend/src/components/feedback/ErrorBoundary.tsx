import type { ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    console.error('UI error boundary caught:', error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-6 text-ink-900">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">System</p>
          <h2 className="mt-2 text-lg font-semibold">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="mt-2 text-sm text-ink-700/80">
            {this.props.fallbackMessage ??
              'Try refreshing the data or returning to this view in a moment.'}
          </p>
          {this.state.error?.message && (
            <p className="mt-3 text-xs text-ink-700/70">{this.state.error.message}</p>
          )}
          <button
            className="mt-4 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper"
            type="button"
            onClick={this.handleReset}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
