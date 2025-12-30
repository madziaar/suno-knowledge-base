import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Ghost } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Check for Pyrite mode via class on body/html (since we can't easily access context outside tree)
      const isPyriteContext = document.body.classList.contains('pyrite-mode');

      return (
        <div className={`min-h-screen flex items-center justify-center p-6 font-mono ${isPyriteContext ? 'bg-black text-purple-500' : 'bg-blue-900 text-white'}`}>
          <div className="max-w-2xl w-full space-y-6">
            <div className="flex items-center gap-4 mb-8">
               {isPyriteContext ? (
                   <Ghost className="w-16 h-16 animate-pulse text-purple-600" />
               ) : (
                   <div className="text-6xl">:(</div>
               )}
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              {isPyriteContext ? "SYSTEM_FAILURE // NEURAL_SEVERANCE" : "Your PC ran into a problem."}
            </h1>
            
            <div className={`p-4 rounded border ${isPyriteContext ? 'bg-purple-900/20 border-purple-500/50' : 'bg-blue-800 border-blue-400'}`}>
              <p className="text-xs md:text-sm font-bold opacity-80 mb-2">ERROR_CODE:</p>
              <code className="block whitespace-pre-wrap text-xs opacity-70">
                {this.state.error?.toString()}
              </code>
            </div>

            <p className="text-sm opacity-60 leading-relaxed">
              {isPyriteContext 
                ? "The logic cores have overheated. The Aleph Null protocol encountered a paradox it could not reconcile. Reboot required to purge volatile memory."
                : "We're just collecting some error info, and then you can restart. Actually, you have to restart yourself."}
            </p>

            <button
              onClick={() => window.location.reload()}
              className={`mt-8 px-6 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center transition-all ${
                  isPyriteContext 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                  : 'bg-white text-blue-900 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isPyriteContext ? "INITIATE_REBOOT_SEQUENCE" : "Restart Application"}
            </button>
            
            {isPyriteContext && (
                <div className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;