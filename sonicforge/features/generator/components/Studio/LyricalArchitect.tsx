
import React, { useState, useCallback, memo } from 'react';
import { Wand2, Ghost, Sparkles, MessageSquare, Maximize2, Zap, Target } from 'lucide-react';
import SmartLyricEditor from '../SmartLyricEditor';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import { usePromptState } from '../../../../contexts/PromptContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { translations } from '../../../../translations';

interface LyricalArchitectProps {
  isPyriteMode: boolean;
  value: string;
  onChange: (val: string) => void;
  genre: string;
  targetLyricsLang?: string;
}

const LyricalArchitect: React.FC<LyricalArchitectProps> = memo(({ isPyriteMode, value, onChange, genre, targetLyricsLang }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { inputs } = usePromptState();
  const { lang } = useSettings();
  
  // Update: Check for ANY non-standard persona to enable advanced hints
  const hasActivePersona = inputs.producerPersona && inputs.producerPersona !== 'standard';
  
  const t = translations[lang].builder.designers.labels;

  const toggleFocus = () => {
      setIsFocusMode(!isFocusMode);
      sfx.play('toggle');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", isPyriteMode ? "bg-purple-900/30 text-purple-400" : "bg-blue-900/30 text-blue-400")}>
                  <Target className="w-4 h-4" />
              </div>
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Lyrical Architecture Hub</h3>
          </div>
          
          <button 
            onClick={toggleFocus}
            className={cn(
                "px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all flex items-center gap-2",
                isFocusMode 
                    ? (isPyriteMode ? "bg-purple-600 border-purple-400 text-white" : "bg-blue-600 border-blue-400 text-white")
                    : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Maximize2 className="w-3 h-3" />
            Focus Mode
          </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
          <div className={cn("flex-1 transition-all duration-700", isFocusMode ? "scale-105" : "")}>
              <SmartLyricEditor 
                value={value}
                onChange={onChange}
                isPyriteMode={isPyriteMode}
                className="h-full border-white/5"
                lang={lang}
                genre={genre}
                targetLyricsLang={targetLyricsLang}
              />
          </div>

          <div className={cn(
              "hidden xl:flex w-64 flex-col gap-4 transition-all duration-500",
              isFocusMode ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"
          )}>
              {/* Ad-lib Generator Side-panel */}
              <div className={cn(
                  "flex-1 p-4 rounded-xl border bg-black/40 space-y-4 overflow-y-auto custom-scrollbar",
                  isPyriteMode ? "border-purple-500/20" : "border-white/5"
              )}>
                  <div className="flex items-center gap-2 mb-2">
                      <Ghost className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          {isPyriteMode ? t.hintLabelPyrite : t.hintLabel}
                      </h4>
                  </div>
                  
                  {hasActivePersona ? (
                      <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
                          <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                              {isPyriteMode ? t.hintMsgPyrite : t.hintMsg}
                          </p>
                          <div className="space-y-1">
                              {['(Glitch)', '(Chaos)', '(Breathe)', '(Shatter)'].map(tag => (
                                  <button 
                                    key={tag}
                                    onClick={() => onChange(value + `\n${tag}`)}
                                    className="w-full text-left p-2 rounded bg-white/5 border border-white/5 hover:border-purple-500/30 text-[10px] font-mono text-purple-300 transition-all"
                                  >
                                      Inject {tag}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                          <MessageSquare className="w-8 h-8 mb-2 text-zinc-700" />
                          <p className="text-[9px] font-bold text-zinc-600 uppercase">Enable Persona for live hints</p>
                      </div>
                  )}
              </div>

              {/* Tips Section */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">V4.5 Logic</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                      "Use vowel extensions like 'go-o-one' for a 200% increase in melodic articulation."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
});

export default LyricalArchitect;
