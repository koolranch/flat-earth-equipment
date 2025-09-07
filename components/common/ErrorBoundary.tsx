import React from 'react';
export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{ fallback?: React.ReactNode }>, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.error('ErrorBoundary', err); }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">Something went wrong loading this module. Try reload.</div>;
    return this.props.children;
  }
}
