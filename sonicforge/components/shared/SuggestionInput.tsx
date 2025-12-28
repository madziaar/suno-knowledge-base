import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import Tooltip from '../Tooltip';

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'pyrite';
  label?: string;
  tooltipContent?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const SuggestionInput: React.FC<SuggestionInputProps> = memo(({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  variant = 'default',
  label,
  tooltipContent,
  onFocus
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isPyrite = variant === 'pyrite';
  
  // Update suggestions when input changes
  useEffect(() => {
    if (!value) {
      setFilteredOptions(options.slice(0, 50)); // Limit for perf
    } else {
      const lower = value.toLowerCase();
      // Simple heuristic sort: starts with > includes
      const startsWith = options.filter(opt => opt.toLowerCase().startsWith(lower));
      const includes = options.filter(opt => !opt.toLowerCase().startsWith(lower) && opt.toLowerCase().includes(lower));
      setFilteredOptions([...startsWith, ...includes].slice(0, 20));
    }
    setActiveIndex(-1);
  }, [value, options]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
        if (e.key === 'ArrowDown') {
            setShowSuggestions(true);
            setFilteredOptions(options.slice(0, 20));
        }
        return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex]);
        } else if (filteredOptions.length > 0 && activeIndex === -1) {
           // Optional: select first on enter if nothing selected? No, usually enter submits form.
           // Only select if user actively navigated
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setShowSuggestions(false);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        const listTop = listRef.current.scrollTop;
        const listBottom = listTop + listRef.current.clientHeight;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.clientHeight;

        if (itemTop < listTop) {
          listRef.current.scrollTop = itemTop;
        } else if (itemBottom > listBottom) {
          listRef.current.scrollTop = itemBottom - listRef.current.clientHeight;
        }
      }
    }
  }, [activeIndex]);

  const handleSelect = (option: string) => {
    onChange(option);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  // Styles
  const labelColor = isPyrite ? 'text-purple-300/80' : 'text-zinc-500';
  
  const inputBase = "w-full rounded-xl p-3 pl-4 pr-10 text-xs md:text-sm outline-none transition-all duration-200 border bg-clip-padding";
  
  const inputStyles = isPyrite 
    ? "bg-zinc-950/50 border-purple-500/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-purple-300/20 text-purple-100" 
    : "bg-zinc-900/50 border-white/10 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-zinc-600 text-zinc-200";
    
  const dropdownBg = isPyrite 
    ? 'bg-zinc-950/95 border-purple-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] ring-1 ring-purple-500/20' 
    : 'bg-zinc-900/95 border-zinc-700 shadow-[0_10px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10';

  const optionHover = isPyrite 
    ? "hover:bg-purple-500/20 hover:text-purple-100" 
    : "hover:bg-yellow-500/10 hover:text-yellow-200";

  const optionActive = isPyrite
    ? "bg-purple-500/20 text-purple-100"
    : "bg-yellow-500/20 text-yellow-200";

  return (
    <div ref={wrapperRef} className="relative w-full group">
      {label && (
        <div className="flex items-center mb-1.5 h-4">
          <label className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors select-none", labelColor)}>
            {label}
          </label>
          {tooltipContent && <Tooltip content={tooltipContent} />}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
          }}
          onFocus={(e) => {
              setShowSuggestions(true);
              if (onFocus) onFocus(e);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(inputBase, inputStyles, className)}
          autoComplete="off"
        />
        
        {/* Dropdown Indicator */}
        <div 
            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center cursor-pointer text-zinc-600 group-hover:text-zinc-400 transition-colors"
            onClick={() => {
                setShowSuggestions(!showSuggestions);
                if (!showSuggestions) inputRef.current?.focus();
            }}
        >
           <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showSuggestions && "rotate-180")} />
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {showSuggestions && filteredOptions.length > 0 && (
        <div className={cn(
            "absolute z-50 left-0 right-0 mt-2 rounded-xl border backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top",
            dropdownBg
        )}>
          {!value && (
             <div className={cn(
                 "px-3 py-2 text-[9px] font-bold uppercase tracking-widest border-b flex items-center bg-white/5 select-none",
                 isPyrite ? 'border-purple-500/20 text-purple-400' : 'border-white/10 text-yellow-500'
             )}>
                <Sparkles className="w-3 h-3 mr-2" />
                Suggestions
             </div>
          )}
          <div ref={listRef} className="max-h-60 overflow-y-auto custom-scrollbar p-1 scroll-smooth">
            {filteredOptions.map((opt, idx) => (
                <button
                    key={`${opt}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                        "w-full text-left px-3 py-2 text-xs md:text-sm rounded-lg transition-all flex items-center justify-between truncate",
                        "text-zinc-400",
                        activeIndex === idx ? optionActive : "",
                        optionHover
                    )}
                >
                    <span className="truncate">{opt}</span>
                </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default SuggestionInput;