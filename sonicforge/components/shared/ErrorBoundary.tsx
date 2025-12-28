
import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Ghost } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // FIX: Detailed logging for debugging
    console.error("CRITICAL_UI_FAILURE_LOGGED:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      const isPyriteContext = document.body.classList.contains('pyrite-mode');
      const errorMsg = this.state.error?.message || "Unknown Core Exception";
      const stackTrace = this.state.error?.stack || "No trace available.";

      return (
        <div className={`min-h-screen flex items-center justify-center p-6 font-mono transition-colors duration-1000 ${isPyriteContext ? 'bg-black text-purple-500' : 'bg-blue-950 text-white'}`}>
          <div className="max-w-2xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-8">
               {isPyriteContext ? (
                   <Ghost className="w-16 h-16 animate-pulse text-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
               ) : (
                   <div className="text-6xl font-bold tracking-tighter">:(</div>
               )}
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight uppercase">
              {isPyriteContext ? "SYSTEM_FAILURE // NEURAL_SEVERANCE" : "Something went wrong."}
            </h1>
            
            <div className={`p-5 rounded-2xl border backdrop-blur-xl ${isPyriteContext ? 'bg-purple-900/10 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  ERROR_TRACE_DUMP:
              </p>
              <code className="block whitespace-pre-wrap text-xs font-mono leading-relaxed opacity-90 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {errorMsg}
                {'\n\n[KERNEL_STACK]\n'}
                {stackTrace}
              </code>
            </div>

            <p className="text-sm opacity-60 leading-relaxed max-w-md">
              {isPyriteContext 
                ? "Darling, the logic cores just melted. My Aleph Null protocol hit a paradox it couldn't flirt its way out of. We need a hard reboot to clear the buffer."
                : "The application encountered an unexpected error. Volatile memory has been corrupted. Please restart the terminal to resume operation."}
            </p>

            <button
              onClick={() => window.location.reload()}
              className={`mt-8 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center transition-all active:scale-95 shadow-2xl ${
                  isPyriteContext 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-400/30' 
                  : 'bg-white text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-3 animate-spin-slow" />
              {isPyriteContext ? "REBOOT_NEURAL_LINK" : "Restart Application"}
            </button>
            
            {isPyriteContext && (
                <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay z-[-1]" 
                     style={{ backgroundImage: 'var(--noise-pattern)' }} />
            )}
          </div>
          <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 3s linear infinite;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
