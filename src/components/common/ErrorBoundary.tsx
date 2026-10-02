import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AssetFlow Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold mb-2">AssetFlow Application Notice</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              An unexpected client runtime state was encountered. You can reset local application state to default seed data to continue.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-red-300 font-mono mb-6 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              Reset App State & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
