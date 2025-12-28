
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isPyrite?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  isPyrite = false,
  icon,
  rightElement,
  containerClassName,
  ...props
}, ref) => {
  const labelColor = isPyrite ? 'text-purple-300/80' : 'text-zinc-500';
  const borderColor = isPyrite ? 'border-purple-500/20 focus:border-purple-500' : 'border-white/10 focus:border-yellow-500';
  const bgColor = isPyrite ? 'bg-zinc-950/50 text-purple-100' : 'bg-zinc-900/50 text-zinc-200';
  const placeholderColor = isPyrite ? 'placeholder:text-purple-300/20' : 'placeholder:text-zinc-600';

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label className={cn("text-[10px] font-bold uppercase tracking-widest block flex items-center gap-1.5", labelColor)}>
          {icon}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl p-3 text-sm outline-none transition-all duration-200 border shadow-inner",
            bgColor,
            borderColor,
            placeholderColor,
            rightElement ? "pr-10" : "",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
});
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  isPyrite?: boolean;
  icon?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  isPyrite = false,
  icon,
  ...props
}, ref) => {
  const labelColor = isPyrite ? 'text-purple-300/80' : 'text-zinc-500';
  const borderColor = isPyrite ? 'border-purple-500/20 focus:border-purple-500' : 'border-white/10 focus:border-yellow-500';
  const bgColor = isPyrite ? 'bg-zinc-950/50 text-purple-100' : 'bg-zinc-900/50 text-zinc-200';
  const placeholderColor = isPyrite ? 'placeholder:text-purple-300/20' : 'placeholder:text-zinc-600';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className={cn("text-[10px] font-bold uppercase tracking-widest block flex items-center gap-1.5", labelColor)}>
          {icon}
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl p-3 text-sm outline-none transition-all duration-200 border shadow-inner resize-none",
          bgColor,
          borderColor,
          placeholderColor,
          className
        )}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";
