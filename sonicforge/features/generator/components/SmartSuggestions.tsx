
import React, { useMemo } from 'react';
import { Lightbulb, AlertTriangle, Plus, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getSmartSuggestions, validateCombination, Suggestion } from '../utils/suggestionEngine';
import { sfx } from '../../../lib/audio';

interface SmartSuggestionsProps {
  genres: string[];
  mood: string;
  instruments: string;
  vocals: string;
  intent: string;
  onAddSuggestion: (suggestion: Suggestion) => void;
  isPyriteMode: boolean;
  mode?: 'custom' | 'general' | 'instrumental' | 'easy';
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  genres,
  mood,
  instruments,
  vocals,
  intent,
  onAddSuggestion,
  isPyriteMode,
  mode
}) => {
  const suggestions = useMemo(() => {
    return getSmartSuggestions(genres, mood, instruments, intent, mode);
  }, [genres, mood, instruments, intent, mode]);

  const validation = useMemo(() => {
    if (genres.length > 0) {
      return validateCombination(genres[0], mood, vocals);
    }
    return { isCompatible: true, warnings: [] };
  }, [genres, mood, vocals]);

  if (suggestions.length === 0 && validation.isCompatible) return null;

  const bgClass = isPyriteMode ? 'bg-purple-900/10 border-purple-500/20' : 'bg-blue-900/10 border-blue-500/20';
  const warningBgClass = isPyriteMode ? 'bg-red-950/40 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-orange-900/10 border-orange-500/30';

  const handleAdd = (s: Suggestion) => {
      sfx.play('success');
      onAddSuggestion(s);
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
      {/* Validation Warnings / Conflicts */}
      {!validation.isCompatible && (
        <div className={cn("p-4 rounded-xl border flex flex-col gap-3", warningBgClass)}>
           <div className="flex items-center gap-2">
               <ShieldAlert className={cn("w-4 h-4", isPyriteMode ? "text-red-400" : "text-orange-500")} />
               <span className={cn("text-[10px] font-black uppercase tracking-widest", isPyriteMode ? "text-red-300" : "text-orange-300")}>
                   Logic Conflict Detected
               </span>
           </div>
           <div className="space-y-2">
                {validation.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-zinc-300 leading-relaxed font-medium pl-6 border-l border-white/10">
                        {w}
                    </p>
                ))}
           </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className={cn("p-3 rounded-xl border relative overflow-hidden", bgClass)}>
          {isPyriteMode && <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles className="w-8 h-8" /></div>}
          <div className="flex items-center gap-2 mb-2">
             <Lightbulb className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-blue-400")} />
             <span className={cn("text-[10px] font-bold uppercase tracking-wider", isPyriteMode ? "text-purple-300" : "text-blue-300")}>
               Neural Signal Augmentation
             </span>
          </div>
          <div className="flex flex-wrap gap-2">
             {suggestions.map((s, i) => (
               <button
                 key={i}
                 onClick={() => handleAdd(s)}
                 className={cn(
                   "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all group",
                   isPyriteMode 
                     ? "bg-black/40 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-500" 
                     : "bg-white/10 border-blue-500/20 text-zinc-300 hover:bg-blue-500/10 hover:text-blue-200"
                 )}
                 title={s.reason}
               >
                 <span>{s.value}</span>
                 <Plus className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 group-hover:rotate-90 transition-transform" />
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
