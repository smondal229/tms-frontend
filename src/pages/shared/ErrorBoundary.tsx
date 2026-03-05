import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
                ⚠️
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>

            {/* Description */}
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred. You can reload the page or return to the dashboard.
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl !bg-slate-900 text-white hover:!bg-slate-800 transition"
              >
                Reload Page
              </button>

              <button
                onClick={this.handleHome}
                className="px-4 py-2 rounded-xl border !border-slate-300 !text-slate-700 hover:!bg-slate-100 transition"
              >
                Go Home
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-slate-400 mt-6">
              If this keeps happening, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
