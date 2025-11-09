import React, { ErrorInfo, ReactNode } from 'react';
import { ICreditUnionLogo } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Using a constructor to initialize state. Class property initialization
  // was causing issues with `this.props` not being found in some environments.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-block p-2 rounded-full bg-slate-700/50 mb-4">
                    <ICreditUnionLogo />
                </div>
                <h1 className="text-2xl font-bold text-red-400">Application Error</h1>
                <p className="text-slate-300 mt-2">
                    We're sorry, but something went wrong.
                </p>
                <p className="text-slate-400 text-sm mt-1">
                    Please try refreshing the page. If the problem persists, please contact our support team.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
