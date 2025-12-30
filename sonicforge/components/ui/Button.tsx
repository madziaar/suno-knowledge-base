
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/haptics';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "ref"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isPyrite?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isPyrite = false, 
  isLoading = false, 
  icon, 
  children, 
  onClick,
  disabled,
  ...props 
}, ref) => {

  const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-bold tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black overflow-hidden select-none";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-4 text-base"
  };

  const variants = {
    primary: isPyrite 
      ? "bg-purple-600 text-white shadow-[0_4px_20px_rgba(147,51,234,0.4)] border border-purple-400/20 focus-visible:ring-purple-500"
      : "bg-yellow-500 text-black shadow-[0_4px_20px_rgba(234,179,8,0.3)] border border-yellow-400/20 focus-visible:ring-yellow-500",
    
    secondary: "bg-zinc-700 text-white shadow-lg border border-zinc-600",
    
    outline: "bg-transparent border border-white/10 text-zinc-300 hover:text-white hover:border-white/20",
    
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
    
    danger: "bg-red-600/10 text-red-400 border border-red-500/20 hover:border-red-500/50"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && !disabled) {
      triggerHaptic('click');
      onClick?.(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit z-20">
          <Loader2 className="w-4 h-4 animate-spin" />
        </span>
      )}
      
      <span className={cn("flex items-center gap-2 relative z-10", isLoading ? "opacity-0" : "opacity-100")}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>

      {/* Kinetic Shine for Primary/Pyrite */}
      {(variant === 'primary') && !disabled && !isLoading && (
        <>
            <motion.div 
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent z-0 pointer-events-none" 
              animate={{ translateX: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatDelay: 3 }}
            />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-50" />
        </>
      )}
    </motion.button>
  );
});

Button.displayName = "Button";
