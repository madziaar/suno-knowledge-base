
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'pyrite' | 'outline' | 'ghost' | 'zinc' | 'riffusion';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const ThemedButton: React.FC<ThemedButtonProps> = memo(({ 
  variant = 'default', 
  className = '', 
  children, 
  isLoading = false, 
  icon,
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative group rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  
  const variants = {
    pyrite: "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border border-purple-400/20 focus-visible:ring-purple-500",
    default: "bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] border border-yellow-400/20 focus-visible:ring-yellow-500",
    zinc: "bg-zinc-700 hover:bg-zinc-600 text-white shadow-[0_4px_20px_rgba(82,82,91,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] border border-zinc-600 focus-visible:ring-zinc-500",
    riffusion: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-500/50 focus-visible:ring-blue-500",
    outline: "bg-transparent border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white focus-visible:ring-zinc-500 hover:border-white/20",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus-visible:ring-zinc-500"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      disabled={disabled || isLoading}
      {...props} 
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit z-20">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}

      {/* Button Content */}
      <span className={cn("flex items-center gap-2 relative z-10", isLoading ? "opacity-0" : "opacity-100")}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>

      {/* Glare / Shimmer Effect (Kinetic) */}
      {(variant === 'pyrite' || variant === 'default' || variant === 'riffusion') && !disabled && !isLoading && (
        <>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-50" />
        </>
      )}
    </button>
  );
});

export default ThemedButton;
