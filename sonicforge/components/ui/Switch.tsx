
import React from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isPyrite?: boolean;
  label?: React.ReactNode;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, isPyrite = false, label, className }) => {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer group", className)}>
      <div className="relative">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)} 
            className="sr-only" 
        />
        <div className={cn(
            "w-9 h-5 rounded-full transition-colors border",
            checked 
                ? (isPyrite ? "bg-purple-600 border-purple-500" : "bg-yellow-500 border-yellow-400") 
                : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-600"
        )}></div>
        <div className={cn(
            "absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
            checked ? "translate-x-4" : "translate-x-0"
        )}></div>
      </div>
      {label && <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors select-none">{label}</span>}
    </label>
  );
};
