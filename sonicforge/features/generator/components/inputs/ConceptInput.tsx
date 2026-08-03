
import React, { memo, useCallback, useState } from 'react';
import { Search, Wand2, Gauge } from 'lucide-react';
import Tooltip from '../../../../components/Tooltip';
import { BuilderTranslation } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { enhancePrompt } from '../../utils/promptEnhancer';
import { sfx } from '../../../../lib/audio';
import { usePromptState } from '../../../../contexts/PromptContext';
import { usePromptActions } from '../../hooks/usePromptActions';
import { motion } from 'framer-motion';

interface ConceptInputProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
  onFocus?: (e: any) => void;
}

const ConceptInput: React.FC<ConceptInputProps> = memo(({ t, isPyriteMode, onFocus }) => {
  const { inputs, useGoogleSearch, lyricSource, enhancementLevel } = usePromptState();
  const { updateInput, setState } = usePromptActions();
  
  const { intent, artistReference } = inputs;
  
  const [isIntentFocused, setIsIntentFocused] = useState(false);
  const [isRefFocused, setIsRefFocused] = useState(false);

  const handleBoost = useCallback(() => {
    if (!intent.trim()) return;
    sfx.play('success');
    const enhanced = enhancePrompt(intent, enhancementLevel);
    updateInput({ intent: enhanced });
  }, [intent, updateInput, enhancementLevel]);

  const setIntent = useCallback((val: string) => updateInput({ intent: val }), [updateInput]);
  const setArtistReference = useCallback((val: string) => updateInput({ artistReference: val }), [updateInput]);
  const setUseGoogleSearch = useCallback((val: boolean) => setState({ useGoogleSearch: val }), [setState]);

  const cycleEnhancementLevel = useCallback(() => {
    const levels: ('light' | 'medium' | 'heavy')[] = ['light', 'medium', 'heavy'];
    const currentIndex = levels.indexOf(enhancementLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setState({ enhancementLevel: levels[nextIndex] });
    sfx.play('click');
  }, [enhancementLevel, setState]);

  // Refined Focus Styles
  const getGlowStyle = (isFocused: boolean) => {
      if (!isFocused) return "border-zinc-800 bg-zinc-900/50";
      return isPyriteMode 
        ? "border-purple-500/50 bg-zinc-950/80 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30" 
        : "border-yellow-500/50 bg-zinc-900/80 shadow-[0_0_20px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/30";
  };

  return (
    <div className="space-y-8 group/inputs">
      {/* Concept / Style Description */}
      <div>
        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
          <div className="flex items-center">
            <label className={cn("text-xs font-bold uppercase tracking-wider transition-colors duration-300", isIntentFocused ? (isPyriteMode ? "text-purple-300" : "text-yellow-600") : "text-zinc-500")}>
              {lyricSource === 'user' ? t.styleLabel : t.conceptLabel}
            </label>
            <Tooltip content={lyricSource === 'user' ? t.tooltips.style : t.tooltips.idea} />
          </div>
          
          <div className="flex items-center gap-3">
              <button 
                onClick={cycleEnhancementLevel}
                className={cn(
                    "flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all border",
                    isPyriteMode ? "border-purple-500/20 text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10" : "border-yellow-500/20 text-zinc-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                )}
                title="Change Enhancement Level"
              >
                  <Gauge className="w-3 h-3" />
                  {enhancementLevel}
              </button>

              <button 
                onClick={handleBoost}
                disabled={!intent.trim()}
                className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border",
                    isPyriteMode 
                        ? "border-pink-500/30 text-pink-300 hover:bg-pink-500/20 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                        : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                )}
                title="Creative Boost (Enhance Prompt)"
              >
                  <Wand2 className="w-3 h-3" />
                  Boost
              </button>
              
              <div className="h-4 w-px bg-zinc-800" />

              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-blue-400 hover:text-blue-300 transition-colors group/search">
                  <input 
                      type="checkbox" 
                      checked={useGoogleSearch} 
                      onChange={e => setUseGoogleSearch(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <Search className="w-3 h-3" />
                  <span className="font-bold tracking-wide group-hover/search:underline">{t.googleBadge}</span>
              </label>
          </div>
        </div>
        
        <motion.div 
            className="relative"
            animate={isIntentFocused ? { scale: 1.005 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              onFocus={(e) => { setIsIntentFocused(true); onFocus?.(e); }}
              onBlur={() => setIsIntentFocused(false)}
              placeholder={lyricSource === 'user' ? t.stylePlaceholder : t.conceptPlaceholder}
              className={cn(
                "w-full rounded-xl p-4 text-zinc-200 outline-none min-h-[120px] resize-y placeholder:text-zinc-600 text-sm leading-relaxed transition-all duration-300 border shadow-inner",
                getGlowStyle(isIntentFocused)
              )}
            />
            <span className="absolute bottom-3 right-3 text-[9px] font-mono text-zinc-600 pointer-events-none">
                  {intent.length}
            </span>
        </motion.div>
      </div>

      {/* Artist Reference */}
      <div>
        <div className="flex flex-wrap items-center mb-3 gap-2">
          <div className="flex items-center">
            <label className={cn("text-xs font-bold uppercase tracking-wider flex items-center transition-colors duration-300", isRefFocused ? (isPyriteMode ? "text-purple-300" : "text-yellow-600") : "text-zinc-500")}>
              {t.artistLabel}
            </label>
            <Tooltip content={t.tooltips.artist} />
          </div>
        </div>
        <motion.div 
            className="relative"
            animate={isRefFocused ? { scale: 1.005 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <textarea
              value={artistReference}
              onChange={(e) => setArtistReference(e.target.value)}
              onFocus={(e) => { setIsRefFocused(true); onFocus?.(e); }}
              onBlur={() => setIsRefFocused(false)}
              placeholder={t.artistPlaceholder}
              className={cn(
                "w-full rounded-xl p-4 text-zinc-200 outline-none min-h-[80px] resize-y placeholder:text-zinc-600 text-sm leading-relaxed transition-all duration-300 border shadow-inner",
                getGlowStyle(isRefFocused)
              )}
            />
        </motion.div>
      </div>
    </div>
  );
});

export default ConceptInput;
