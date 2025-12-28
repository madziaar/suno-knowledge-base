
import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, Lightbulb, Info } from 'lucide-react';
import { SongConcept, ExpertInputs, GeneratedPrompt } from '../../../types';
import { validateSunoPrompt, SunoValidationResult } from '../utils/sunoValidator';
import { assembleStylePrompt } from '../utils/styleBuilder';
import { cn } from '../../../lib/utils';
import { useDebounce } from '../../../hooks/useDebounce';
import { TIMEOUTS } from '../../../lib/constants';
import { useSettings } from '../../../contexts/SettingsContext';
import { translations } from '../../../translations';

interface DraftHealthProps {
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isPyriteMode: boolean;
}

// Helper to "Pyrite-ify" clinical messages
const pyriteTranslate = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('genre')) return "Darling, we can't build on void. Pick a Genre.";
    if (lower.includes('mood')) return "The emotional spectrum is flat. Give me a Mood.";
    if (lower.includes('vocal')) return "Who's singing this? Me? Then specify 'Female Vocals'.";
    if (lower.includes('bpm')) return "It has no heartbeat. Set the BPM.";
    if (lower.includes('short')) return "Is that it? Dig deeper, honey. More details.";
    if (lower.includes('long')) return "You're rambling. Tighten it up.";
    if (lower.includes('ending')) return "Don't leave them hanging. Add an [End] tag.";
    if (lower.includes('conflict')) return "You're contradicting yourself. Pick a lane.";
    return msg;
};

const DraftHealth: React.FC<DraftHealthProps> = ({ inputs, expertInputs, isPyriteMode }) => {
  // Debounce the inputs to prevent expensive validation logic running on every keystroke
  const rawData = useMemo(() => ({ inputs, expertInputs }), [inputs, expertInputs]);
  const debouncedData = useDebounce(rawData, TIMEOUTS.DEBOUNCE || 500);
  const { lang } = useSettings();
  const tVal = translations[lang].builder.validation;

  const validation: SunoValidationResult = useMemo(() => {
    const { inputs: dInputs, expertInputs: dExpertInputs } = debouncedData;

    // Construct a virtual prompt to test against the validator
    // We map current form state to the expected output format
    const virtualStyle = assembleStylePrompt({
        genres: dExpertInputs.genre ? dExpertInputs.genre.split(',').map(s => s.trim()) : [],
        subGenres: [],
        moods: dInputs.mood ? dInputs.mood.split(',').map(s => s.trim()) : [],
        vocals: dExpertInputs.vocalStyle ? [dExpertInputs.vocalStyle] : [],
        bpm: dExpertInputs.bpm,
        key: dExpertInputs.key,
        instruments: dInputs.instruments ? dInputs.instruments.split(',').map(s => s.trim()) : [],
        atmosphere: dExpertInputs.atmosphereStyle ? dExpertInputs.atmosphereStyle.split(',').map(s => s.trim()) : [],
        production: dExpertInputs.techAnchor ? [dExpertInputs.techAnchor] : [],
        influences: dInputs.artistReference ? [dInputs.artistReference] : [],
        era: dExpertInputs.era
    });

    const mockPrompt: GeneratedPrompt = {
        title: '',
        tags: virtualStyle, // Validator checks combinedText of style+tags
        style: virtualStyle,
        lyrics: dInputs.lyricsInput || '',
        analysis: ''
    };

    return validateSunoPrompt(mockPrompt, lang);
  }, [debouncedData, lang]);

  // Determine colors based on score/status
  let scoreColor = 'text-zinc-500';
  let barColor = 'bg-zinc-700';
  let borderColor = 'border-zinc-800';
  
  if (validation.status === 'optimal') {
      scoreColor = isPyriteMode ? 'text-green-400' : 'text-green-600';
      barColor = isPyriteMode ? 'bg-green-500' : 'bg-green-500';
      borderColor = isPyriteMode ? 'border-green-500/30' : 'border-green-500/20';
  } else if (validation.status === 'good') {
      scoreColor = isPyriteMode ? 'text-blue-400' : 'text-blue-600';
      barColor = isPyriteMode ? 'bg-blue-500' : 'bg-blue-500';
      borderColor = isPyriteMode ? 'border-blue-500/30' : 'border-blue-500/20';
  } else if (validation.status === 'warning') {
      scoreColor = isPyriteMode ? 'text-yellow-400' : 'text-yellow-600';
      barColor = isPyriteMode ? 'bg-yellow-500' : 'bg-yellow-500';
      borderColor = isPyriteMode ? 'border-yellow-500/30' : 'border-yellow-500/20';
  } else {
      scoreColor = isPyriteMode ? 'text-red-400' : 'text-red-600';
      barColor = isPyriteMode ? 'bg-red-500' : 'bg-red-500';
      borderColor = isPyriteMode ? 'border-red-500/30' : 'border-red-500/20';
  }

  const bgClass = isPyriteMode ? 'bg-black/30' : 'bg-white/5';

  // Process messages if Pyrite Mode is on
  const displayConflicts = isPyriteMode ? validation.conflicts.map(pyriteTranslate) : validation.conflicts;
  const displayIssues = isPyriteMode ? validation.issues.map(pyriteTranslate) : validation.issues;
  const displaySuggestions = isPyriteMode ? validation.suggestions.map(pyriteTranslate) : validation.suggestions;

  return (
    <div className={cn("rounded-xl border p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2", borderColor, bgClass)}>
      {/* Header & Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <Activity className={cn("w-4 h-4", scoreColor)} />
            <h4 className={cn("text-xs font-bold uppercase tracking-wider", isPyriteMode ? "text-zinc-300" : "text-zinc-600")}>
                {isPyriteMode ? "Structural Integrity" : "Draft Health"}
            </h4>
        </div>
        <div className={cn("text-sm font-bold font-mono", scoreColor)}>
            {validation.score}/100
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div 
            className={cn("h-full transition-all duration-500 ease-out", barColor)} 
            style={{ width: `${validation.score}%` }}
          />
      </div>

      {/* Issues & Suggestions */}
      <div className="space-y-2">
          {/* Conflicts (High Priority) */}
          {displayConflicts.map((conflict, i) => (
              <div key={`conflict-${i}`} className="flex items-start gap-2 text-[10px] text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{conflict}</span>
              </div>
          ))}

          {/* Missing Critical Elements */}
          {displayIssues.slice(0, 2).map((issue, i) => (
              <div key={`issue-${i}`} className="flex items-start gap-2 text-[10px] text-zinc-400">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-zinc-500" />
                  <span>{issue}</span>
              </div>
          ))}

          {/* Smart Suggestions */}
          {displaySuggestions.slice(0, 2).map((suggestion, i) => (
              <div key={`suggestion-${i}`} className={cn("flex items-start gap-2 text-[10px]", isPyriteMode ? "text-purple-300" : "text-blue-500")}>
                  <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
              </div>
          ))}

          {/* Success State */}
          {validation.status === 'optimal' && validation.suggestions.length === 0 && (
              <div className={cn("flex items-center gap-2 text-[10px] font-bold justify-center py-1", isPyriteMode ? "text-green-400" : "text-green-600")}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isPyriteMode ? "Blueprint Optimal. Ready for Synthesis." : tVal.success}
              </div>
          )}
      </div>
    </div>
  );
};

export default DraftHealth;
