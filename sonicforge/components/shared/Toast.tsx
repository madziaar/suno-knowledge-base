
import React from 'react';
import { Sparkles, Terminal, AlertTriangle, X, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastState {
  msg: string;
  type: 'success' | 'info' | 'error';
  visible: boolean;
}

interface ToastProps {
  toast: ToastState;
  isPyriteMode: boolean;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, isPyriteMode, onDismiss }) => {
  let bgClass = "bg-zinc-900/95";
  let borderClass = isPyriteMode ? "border-purple-500/40" : "border-yellow-500/40";
  let textClass = isPyriteMode ? "text-purple-100" : "text-zinc-100";
  let iconClass = isPyriteMode ? "text-purple-400" : "text-yellow-400";
  let bgHighlight = isPyriteMode ? "shadow-[0_0_30px_rgba(168,85,247,0.15)]" : "shadow-[0_0_30px_rgba(234,179,8,0.15)]";
  let Icon = Info;

  if (toast.type === 'success') {
    borderClass = "border-green-500/40";
    iconClass = "text-green-400";
    bgHighlight = "shadow-[0_0_30px_rgba(74,222,128,0.15)]";
    Icon = isPyriteMode ? Sparkles : CheckCircle2;
  } else if (toast.type === 'error') {
    borderClass = "border-red-500/40";
    iconClass = "text-red-400";
    textClass = "text-red-100";
    bgHighlight = "shadow-[0_0_30px_rgba(248,113,113,0.15)]";
    Icon = AlertTriangle;
  } else if (toast.type === 'info') {
    Icon = Terminal;
  }

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div 
          className="fixed top-24 right-1/2 md:translate-x-0 md:right-8 z-[100] max-w-[90vw] md:max-w-md w-full pointer-events-none origin-top"
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: -20, scale: 0.9, x: '50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          // Media query override for desktop alignment needs to be handled via variants or style if x transform is dynamic
          style={{ x: window.innerWidth >= 768 ? '0%' : '50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className={cn(
            "pointer-events-auto flex items-start justify-between gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-xl",
            bgClass,
            borderClass,
            textClass,
            bgHighlight
          )}>
            <div className="flex items-center gap-3 flex-1">
              <div className={cn("p-1.5 rounded-lg bg-white/5", iconClass)}>
                 <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="text-xs md:text-sm font-bold font-mono tracking-wide leading-tight break-words">
                {toast.msg}
              </span>
            </div>
            
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="p-1.5 -mr-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-500 hover:text-white group"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
