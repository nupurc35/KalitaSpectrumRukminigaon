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
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold mb-3">Something went wrong</h1>
            <p className="text-white/60 mb-8">
              We encountered an unexpected error. Our team has been notified. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-3 rounded-full bg-secondary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 rounded-full bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
