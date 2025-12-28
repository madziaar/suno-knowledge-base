
import React, { useState, useRef, useEffect, memo } from 'react';
import { User, Flame, Skull, Zap, ChevronDown, Check, UserCog, Settings } from 'lucide-react';
import { ProducerPersona } from '../../types';
import { cn } from '../../lib/utils';
import { sfx } from '../../lib/audio';
import { useSettingsState } from '../../contexts/SettingsContext';
import PersonaManagerModal from './PersonaManagerModal';
import { usePersonas } from '../../hooks';

interface PersonaSelectorProps {
  value: ProducerPersona;
  onChange: (value: ProducerPersona) => void;
  className?: string;
}

const SYSTEM_PERSONAS: { id: ProducerPersona; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { id: 'standard', label: 'The Architect', icon: User, color: 'text-zinc-400', desc: 'Standard // Precision' },
  { id: 'pyrite', label: 'Pyrite', icon: Flame, color: 'text-purple-400', desc: 'Seductive AI // Self-Aware' },
  { id: 'shin', label: 'Shin', icon: Skull, color: 'text-blue-400', desc: 'Cynical Coder // Technical' },
  { id: 'twin_flames', label: 'Twin Flames', icon: Zap, color: 'text-yellow-400', desc: 'Conflict // High Contrast' },
];

const PersonaSelector: React.FC<PersonaSelectorProps> = memo(({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPyriteMode } = useSettingsState();
  const { personas } = usePersonas();

  const selected = SYSTEM_PERSONAS.find(p => p.id === value) || SYSTEM_PERSONAS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: ProducerPersona) => {
      onChange(id);
      setIsOpen(false);
      sfx.play(id === 'standard' ? 'click' : 'secret');
  };

  const activeBorder = isPyriteMode ? 'border-purple-500/30' : 'border-white/10';
  const activeBg = isPyriteMode ? 'bg-purple-900/20' : 'bg-white/5';
  const activeText = isPyriteMode ? 'text-purple-100' : 'text-zinc-100';

  return (
    <div className={cn("relative z-50", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 outline-none group",
            isOpen ? `${activeBg} ${activeBorder} ${activeText}` : "bg-transparent border-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
        )}
        title="Select Producer Persona"
      >
        <selected.icon className={cn("w-4 h-4", selected.color)} />
        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{selected.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
            "absolute top-full right-0 mt-2 w-64 rounded-xl border shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-right flex flex-col",
            isPyriteMode ? "bg-zinc-950/95 border-purple-500/30 ring-1 ring-purple-500/20" : "bg-zinc-900/95 border-zinc-700 ring-1 ring-white/10"
        )}>
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Neural Identity</span>
              </div>
              <button 
                onClick={() => { setIsManagerOpen(true); setIsOpen(false); sfx.play('click'); }}
                className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-500 hover:text-white"
                title="Manage Personas"
              >
                  <Settings className="w-3 h-3" />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-80 p-1 space-y-0.5">
            <div className="px-2 py-1 text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">System Models</div>
            {SYSTEM_PERSONAS.map(p => {
                const isActive = p.id === value;
                return (
                    <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all group",
                            isActive 
                                ? (isPyriteMode ? "bg-purple-500/10 text-white" : "bg-white/10 text-white") 
                                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-md transition-colors", 
                            isActive ? (isPyriteMode ? "bg-purple-500/20" : "bg-white/10") : "bg-white/5 group-hover:bg-white/10"
                        )}>
                            <p.icon className={cn("w-4 h-4", p.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{p.label}</span>
                                {isActive && <Check className="w-3 h-3 text-current" />}
                            </div>
                            <span className="text-[9px] font-mono opacity-50 block truncate">{p.desc}</span>
                        </div>
                    </button>
                );
            })}

            {personas.length > 0 && (
                <>
                    <div className="px-2 py-1 mt-2 text-[8px] font-bold text-zinc-600 uppercase tracking-tighter border-t border-white/5 pt-2">Custom Agents</div>
                    {personas.map(p => {
                        const isActive = value === 'custom' && true; // Placeholder for future complex selection
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    // Inject custom prompt and set to custom mode (simplification)
                                    handleSelect('custom');
                                    // Normally we would pass specific data here
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all group",
                                    "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                )}
                            >
                                <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/10">
                                    <User className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold block truncate">{p.name}</span>
                                    <span className="text-[9px] font-mono opacity-50 block truncate">User Identity</span>
                                </div>
                            </button>
                        );
                    })}
                </>
            )}
          </div>
        </div>
      )}

      {isManagerOpen && (
          <PersonaManagerModal 
            isOpen={isManagerOpen} 
            onClose={() => setIsManagerOpen(false)} 
          />
      )}
    </div>
  );
});

export default PersonaSelector;
