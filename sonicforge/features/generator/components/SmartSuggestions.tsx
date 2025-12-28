
import React, { useMemo } from 'react';
import { Lightbulb, AlertTriangle, Plus } from 'lucide-react';
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
    // Use first genre for primary validation
    if (genres.length > 0) {
      return validateCombination(genres[0], mood, vocals);
    }
    return { isCompatible: true, warnings: [] };
  }, [genres, mood, vocals]);

  if (suggestions.length === 0 && validation.isCompatible) return null;

  const bgClass = isPyriteMode ? 'bg-purple-900/10 border-purple-500/20' : 'bg-blue-900/10 border-blue-500/20';
  const warningBgClass = isPyriteMode ? 'bg-red-900/20 border-red-500/30' : 'bg-orange-900/10 border-orange-500/30';

  const handleAdd = (s: Suggestion) => {
      sfx.play('success');
      onAddSuggestion(s);
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
      {/* Validation Warnings */}
      {validation.warnings.map((w, i) => (
        <div key={i} className={cn("p-3 rounded-xl border flex items-start gap-3", warningBgClass)}>
           <AlertTriangle className={cn("w-4 h-4 mt-0.5", isPyriteMode ? "text-red-400" : "text-orange-500")} />
           <p className="text-xs text-zinc-300 leading-relaxed">{w}</p>
        </div>
      ))}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className={cn("p-3 rounded-xl border", bgClass)}>
          <div className="flex items-center gap-2 mb-2">
             <Lightbulb className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-blue-400")} />
             <span className={cn("text-[10px] font-bold uppercase tracking-wider", isPyriteMode ? "text-purple-300" : "text-blue-300")}>
               Smart Suggestions
             </span>
          </div>
          <div className="flex flex-wrap gap-2">
             {suggestions.map((s, i) => (
               <button
                 key={i}
                 onClick={() => handleAdd(s)}
                 className={cn(
                   "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all group",
                   isPyriteMode 
                     ? "bg-black/30 border-purple-500/30 text-purple-200 hover:bg-purple-500/20" 
                     : "bg-white/10 border-blue-500/20 text-zinc-300 hover:bg-blue-500/10 hover:text-blue-200"
                 )}
                 title={s.reason}
               >
                 <span>{s.value}</span>
                 <Plus className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
