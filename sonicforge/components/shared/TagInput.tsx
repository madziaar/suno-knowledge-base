
import React, { useState, useRef, useEffect, memo } from 'react';
import { X, Plus, Sparkles, ChevronDown, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../lib/audio';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: { primary: string[]; secondary: string[]; other: string[] };
  placeholder?: string;
  label?: string;
  isPyriteMode: boolean;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = memo(({
  value,
  onChange,
  suggestions,
  placeholder = "Add tags...",
  label,
  isPyriteMode,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const allSuggestions = [
    ...suggestions.primary.map(v => ({ value: v, category: 'Primary' })),
    ...suggestions.secondary.map(v => ({ value: v, category: 'Secondary' })),
    ...suggestions.other.map(v => ({ value: v, category: 'More' }))
  ];

  const filteredSuggestions = allSuggestions.filter(s => 
    !tags.includes(s.value) && 
    s.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange(value ? `${value}, ${trimmed}` : trimmed);
      sfx.play('click');
    }
    setInputValue('');
    setActiveIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(', '));
    sfx.play('toggle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        addTag(filteredSuggestions[activeIndex].value);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const accentColor = isPyriteMode ? 'border-purple-500/50' : 'border-yellow-500/50';
  const glowClass = isPyriteMode ? 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'shadow-[0_0_15px_rgba(234,179,8,0.1)]';

  return (
    <div className={cn("relative w-full group", className)} ref={containerRef}>
      {label && (
        <label className={cn(
          "text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5",
          isPyriteMode ? "text-purple-400" : "text-zinc-500"
        )}>
          <Hash className="w-3 h-3" />
          {label}
        </label>
      )}

      <div 
        className={cn(
          "min-h-[44px] w-full flex flex-wrap gap-2 p-2 rounded-xl border transition-all duration-300",
          isPyriteMode ? "bg-zinc-950/50 border-white/5" : "bg-zinc-900/50 border-white/5",
          isOpen && cn(accentColor, glowClass)
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {tags.map(tag => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border backdrop-blur-md",
                isPyriteMode 
                  ? "bg-purple-900/20 border-purple-500/30 text-purple-200" 
                  : "bg-white/5 border-white/10 text-zinc-300"
              )}
            >
              {tag}
              <button 
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 min-w-[120px] placeholder:text-zinc-600"
        />
        
        <div className="flex items-center pr-1 text-zinc-600 group-hover:text-zinc-400 transition-colors">
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute z-50 left-0 right-0 mt-2 p-1 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar",
            isPyriteMode ? "bg-zinc-950/95 border-purple-500/30" : "bg-zinc-900/95 border-zinc-700"
          )}
        >
          {['Primary', 'Secondary', 'More'].map(cat => {
            const catItems = filteredSuggestions.filter(s => s.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="mb-2 last:mb-0">
                <div className="px-3 py-1 text-[9px] font-bold uppercase text-zinc-500 tracking-tighter">
                  {cat}
                </div>
                {catItems.map((item, idx) => {
                  const globalIdx = filteredSuggestions.findIndex(s => s.value === item.value);
                  return (
                    <button
                      key={item.value}
                      onClick={() => addTag(item.value)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between",
                        globalIdx === activeIndex 
                          ? (isPyriteMode ? "bg-purple-500/20 text-purple-200" : "bg-yellow-500/10 text-yellow-200")
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      {item.value}
                      {cat === 'Primary' && <Sparkles className="w-3 h-3 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
          
          {inputValue && !allSuggestions.some(s => s.value.toLowerCase() === inputValue.toLowerCase()) && (
             <button
               onClick={() => addTag(inputValue)}
               className={cn(
                 "w-full text-left px-3 py-3 text-xs font-bold border-t border-white/5 transition-all flex items-center gap-2",
                 isPyriteMode ? "text-purple-400 hover:bg-purple-500/10" : "text-blue-400 hover:bg-white/5"
               )}
             >
               <Plus className="w-3.5 h-3.5" />
               Add Custom: "{inputValue}"
             </button>
          )}
        </motion.div>
      )}
    </div>
  );
});

export default TagInput;
