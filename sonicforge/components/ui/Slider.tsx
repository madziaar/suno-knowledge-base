
import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  isPyrite?: boolean;
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  isPyrite = false, 
  label,
  className,
  ...props 
}) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isPyrite ? "text-purple-300/80" : "text-zinc-500")}>
                {label}
            </span>
            <span className="text-xs font-mono text-zinc-400">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
            "w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer",
            isPyrite ? "accent-purple-500" : "accent-yellow-500"
        )}
        {...props}
      />
    </div>
  );
};
