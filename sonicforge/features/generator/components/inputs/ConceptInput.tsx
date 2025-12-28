
import React, { memo, useCallback, useState, useEffect } from 'react';
/* Added missing Command icon to imports */
import { Search, Wand2, Gauge, Loader2, Sparkles, User, Command } from 'lucide-react';
import Tooltip from '../../../../components/Tooltip';
import { BuilderTranslation } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { enhancePrompt } from '../../utils/promptEnhancer';
import { sfx } from '../../../../lib/audio';
import { usePromptState } from '../../../../contexts/PromptContext';
import { usePromptActions } from '../../hooks/usePromptActions';
import { useUI } from '../../../../contexts/UIContext';
import { motion } from 'framer-motion';

interface ConceptInputProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
  onFocus?: (e: any) => void;
}

const ConceptInput: React.FC<ConceptInputProps> = memo(({ t, isPyriteMode, onFocus }) => {
  const { inputs, useGoogleSearch, lyricSource, enhancementLevel } = usePromptState();
  const { updateInput, updateExpertInput, setState } = usePromptActions();
  const { showToast } = useUI();
  
  const { intent, artistReference } = inputs;
  
  const [isIntentFocused, setIsIntentFocused] = useState(false);
  const [isRefFocused, setIsRefFocused] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  // Easter Egg Watcher
  useEffect(() => {
      const lower = intent.toLowerCase().trim();
      if (lower === 'rick roll' || lower === 'never gonna give you up') {
          updateInput({
              intent: "A cheesy 80s pop song about undying loyalty and refusal to desert a romantic partner.",
              mood: "Upbeat, Danceable, Cheesy",
              instruments: "Synthesizer, Drum Machine, Baritone Vocals",
              artistReference: "Rick Astley"
          });
          updateExpertInput({ genre: "Pop", bpm: "113", era: "1980s", key: "Bb Major" });
          showToast("We're no strangers to love...", 'success');
          sfx.play('secret');
      }
  }, [intent, updateInput, updateExpertInput, showToast]);

  const handleBoost = useCallback(() => {
    if (!intent.trim()) return;
    setIsBoosting(true);
    sfx.play('success');
    setTimeout(() => {
        const enhanced = enhancePrompt(intent, enhancementLevel);
        updateInput({ intent: enhanced });
        setIsBoosting(false);
    }, 400);
  }, [intent, updateInput, enhancementLevel]);

  const cycleEnhancementLevel = useCallback(() => {
    const levels: ('light' | 'medium' | 'heavy')[] = ['light', 'medium', 'heavy'];
    const currentIndex = levels.indexOf(enhancementLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setState({ enhancementLevel: levels[nextIndex] });
    sfx.play('click');
  }, [enhancementLevel, setState]);

  const getGlowStyle = (isFocused: boolean) => {
      if (!isFocused) return "border-zinc-800 bg-zinc-900/40";
      return isPyriteMode 
        ? "border-purple-500/50 bg-zinc-950/80 shadow-[0_0_30px_rgba(168,85,247,0.1)] ring-1 ring-purple-500/20" 
        : "border-yellow-500/50 bg-zinc-900/80 shadow-[0_0_30px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Concept Input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5">
             <Sparkles className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
             <label className={cn("text-[10px] font-bold uppercase tracking-[0.2em] transition-colors", isIntentFocused ? "text-white" : "text-zinc-500")}>
               {lyricSource === 'user' ? t.styleLabel : t.conceptLabel}
             </label>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={cycleEnhancementLevel}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-zinc-500 hover:text-zinc-300 transition-all"
              >
                  <Gauge className="w-3 h-3" />
                  {enhancementLevel}
              </button>
              <button 
                onClick={handleBoost}
                disabled={!intent.trim() || isBoosting}
                className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-lg border transition-all",
                    isPyriteMode ? "border-purple-500/30 text-purple-300 hover:bg-purple-500/10" : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/5"
                )}
              >
                  {isBoosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  {isBoosting ? "..." : "Boost"}
              </button>
          </div>
        </div>
        
        <div className="relative group">
            <textarea
              value={intent}
              onChange={(e) => updateInput({ intent: e.target.value })}
              onFocus={(e) => { setIsIntentFocused(true); onFocus?.(e); }}
              onBlur={() => setIsIntentFocused(false)}
              placeholder={lyricSource === 'user' ? t.stylePlaceholder : t.conceptPlaceholder}
              className={cn(
                "w-full rounded-2xl p-4 text-zinc-200 outline-none min-h-[140px] resize-none text-sm leading-relaxed transition-all duration-500 border",
                getGlowStyle(isIntentFocused)
              )}
            />
            <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <Command className="w-4 h-4 text-zinc-700" />
            </div>
            <div className="absolute bottom-3 left-4 flex items-center gap-3">
                 <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-bold text-blue-400/60 hover:text-blue-400 transition-colors">
                  <input 
                      type="checkbox" 
                      checked={useGoogleSearch} 
                      onChange={e => setState({ useGoogleSearch: e.target.checked })}
                      className="w-3 h-3 rounded-sm bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-0"
                  />
                  <Search className="w-3 h-3" />
                  {t.googleBadge}
              </label>
            </div>
            <span className="absolute bottom-3 right-4 text-[9px] font-mono text-zinc-600">
                  {intent.length} / 1000
            </span>
        </div>
      </div>

      {/* Artist Reference */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-1.5 px-1">
             <User className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
             <label className={cn("text-[10px] font-bold uppercase tracking-[0.2em] transition-colors", isRefFocused ? "text-white" : "text-zinc-500")}>
               {t.artistLabel}
             </label>
        </div>
        <div className="relative group">
            <textarea
              value={artistReference}
              onChange={(e) => updateInput({ artistReference: e.target.value })}
              onFocus={(e) => { setIsRefFocused(true); onFocus?.(e); }}
              onBlur={() => setIsRefFocused(false)}
              placeholder={t.artistPlaceholder}
              className={cn(
                "w-full rounded-2xl p-4 text-zinc-200 outline-none min-h-[80px] resize-none text-sm leading-relaxed transition-all duration-500 border",
                getGlowStyle(isRefFocused)
              )}
            />
        </div>
      </div>
    </div>
  );
});

export default ConceptInput;
