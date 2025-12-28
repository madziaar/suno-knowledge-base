
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  variant?: 'default' | 'pyrite';
  className?: string;
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  variant = 'default',
  className,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPyrite = variant === 'pyrite';

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Styles
  const labelColor = isPyrite ? 'text-purple-300/80' : 'text-zinc-500';
  const triggerBase = "w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs md:text-sm transition-all duration-200 border cursor-pointer select-none";
  
  const triggerStyles = isOpen
    ? (isPyrite 
        ? "bg-zinc-950 border-purple-500 ring-1 ring-purple-500/50 text-white" 
        : "bg-zinc-900 border-yellow-500 ring-1 ring-yellow-500/50 text-white")
    : (isPyrite
        ? "bg-zinc-950/50 border-purple-500/20 text-zinc-300 hover:bg-purple-500/10 hover:border-purple-500/40"
        : "bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20");

  const dropdownBg = isPyrite 
    ? 'bg-zinc-950/95 border-purple-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.8)] ring-1 ring-purple-500/20' 
    : 'bg-zinc-900/95 border-zinc-700 shadow-[0_8px_30px_rgba(0,0,0,0.6)] ring-1 ring-white/10';

  const optionHover = isPyrite
    ? "hover:bg-purple-500/20 hover:text-purple-100 focus:bg-purple-500/20"
    : "hover:bg-yellow-500/10 hover:text-yellow-100 focus:bg-yellow-500/10";

  const optionActive = isPyrite
    ? "bg-purple-500/10 text-purple-300"
    : "bg-yellow-500/10 text-yellow-400";

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className={cn("text-[10px] font-bold uppercase tracking-widest mb-1.5 block flex items-center gap-1.5", labelColor)}>
          {icon}
          {label}
        </label>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(triggerBase, triggerStyles)}
      >
        <span className={cn("truncate", !selectedOption && "text-zinc-500 italic")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300 opacity-60", isOpen && "rotate-180 opacity-100")} />
      </div>

      {isOpen && (
        <div className={cn(
          "absolute z-50 left-0 right-0 mt-2 py-1 rounded-xl border backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top",
          dropdownBg
        )}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs md:text-sm rounded-lg transition-colors flex items-center justify-between group",
                    isSelected ? optionActive : "text-zinc-400",
                    optionHover
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
