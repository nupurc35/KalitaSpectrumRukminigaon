import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <h1 className="text-3xl font-serif mb-3">Something went wrong</h1>
            <p className="text-white/60 mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-6 py-3 rounded-full bg-secondary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
