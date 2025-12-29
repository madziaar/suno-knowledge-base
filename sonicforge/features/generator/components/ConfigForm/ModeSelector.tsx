
import React, { memo } from 'react';
import { Sparkles, PenTool, Zap, BrainCircuit, History } from 'lucide-react';
import Tooltip from '../../../../components/Tooltip';
import { BuilderTranslation, SunoVersion } from '../../../../types';
import { Switch } from '../../../../components/ui/Switch';
import { cn } from '../../../../lib/utils';
import CustomSelect from '../../../../components/shared/CustomSelect';
import { usePromptActions, usePromptState } from '../../../../contexts/PromptContext';

interface ModeSelectorProps {
  mode: 'custom' | 'general' | 'instrumental' | 'easy';
  setMode: (mode: 'custom' | 'general' | 'instrumental' | 'easy') => void;
  lyricSource: 'ai' | 'user';
  setLyricSource: (source: 'ai' | 'user') => void;
  useReMi: boolean;
  setUseReMi: (val: boolean) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = memo(({
  mode,
  setMode,
  lyricSource,
  setLyricSource,
  useReMi,
  setUseReMi,
  t,
  isPyriteMode
}) => {
  const { inputs } = usePromptState();
  const { updateInput } = usePromptActions();

  const activeBorder = isPyriteMode ? 'border-purple-500' : 'border-yellow-500';
  const activeText = isPyriteMode ? 'text-purple-400' : 'text-yellow-400';
  const activeBg = isPyriteMode ? 'bg-purple-500/20' : 'bg-yellow-500/20';
  const activeShadow = isPyriteMode ? 'shadow-[0_0_10px_rgba(147,51,234,0.2)]' : 'shadow-[0_0_10px_rgba(234,179,8,0.2)]';

  const VERSIONS: { label: string, value: SunoVersion }[] = [
      { label: 'v5 (Premier)', value: 'v5' },
      { label: 'v4.5+ (Pro)', value: 'v4.5+' },
      { label: 'v4.5 (Free)', value: 'v4.5' },
      { label: 'v4 (Legacy)', value: 'v4' },
      { label: 'v3.5 (Deprecated)', value: 'v3.5' },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Top Controls: Mode & Version */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <div className="flex flex-wrap items-center mb-2 gap-2">
                  <div className="flex items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.mode}</label>
                    <Tooltip content={t.tooltips.mode} />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['easy', 'custom', 'instrumental', 'general'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m as any);
                        if (m === 'instrumental' || m === 'easy') setLyricSource('ai');
                      }}
                      type="button"
                      className={`p-2 md:p-3 min-h-[44px] rounded-lg border text-xs md:text-sm font-medium capitalize transition-all truncate flex items-center justify-center ${
                        mode === m
                          ? `${activeBg} ${activeBorder} ${activeText} ${activeShadow}`
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {m === 'easy' && <Zap className="w-3 h-3 mr-1.5" />}
                      {t.modes[m as keyof typeof t.modes]}
                    </button>
                  ))}
                </div>
            </div>

            <div className="w-full md:w-48">
                 <div className="flex items-center mb-2 gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Model</label>
                 </div>
                 <CustomSelect 
                    value={inputs.sunoVersion || 'v5'}
                    onChange={(val) => updateInput({ sunoVersion: val as SunoVersion })}
                    options={VERSIONS}
                    variant={isPyriteMode ? 'pyrite' : 'default'}
                    icon={<History className="w-3.5 h-3.5" />}
                    placeholder="Select Version"
                 />
            </div>
        </div>
      </div>

      {(mode === 'custom' || mode === 'instrumental') && (
        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
             <div className="flex items-center">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.lyricSource}</label>
               <Tooltip content={t.tooltips.source} />
             </div>
             
             {/* ReMi Toggle (Only visible if AI lyrics selected) */}
             {lyricSource === 'ai' && (
                 <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                     <span className={cn("text-[10px] font-bold uppercase tracking-wider", useReMi ? (isPyriteMode ? "text-pink-400" : "text-yellow-600") : "text-zinc-500")}>
                         {t.aiLyricOptions.remi}
                     </span>
                     <Switch 
                        checked={useReMi} 
                        onChange={setUseReMi} 
                        isPyrite={isPyriteMode} 
                     />
                     <Tooltip content={t.aiLyricOptions.remiTooltip} />
                 </div>
             )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
             <button
               onClick={() => setLyricSource('ai')}
               type="button"
               className={`p-2 md:p-3 min-h-[44px] rounded-lg border text-xs md:text-sm flex items-center justify-center transition-all ${
                 lyricSource === 'ai' 
                   ? `${isPyriteMode ? 'bg-purple-900/20 border-purple-500 text-purple-300' : 'bg-purple-900/20 border-purple-500 text-purple-300'}` 
                   : 'bg-zinc-900 border-zinc-800 text-zinc-500'
               }`}
             >
               {useReMi ? <BrainCircuit className="w-3 h-3 md:w-4 md:h-4 mr-2" /> : <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" />}
               {t.sources.ai} {useReMi && "(ReMi)"}
             </button>
             <button
               onClick={() => setLyricSource('user')}
               type="button"
               className={`p-2 md:p-3 min-h-[44px] rounded-lg border text-xs md:text-sm flex items-center justify-center transition-all ${
                 lyricSource === 'user' 
                   ? 'bg-blue-900/20 border-blue-500 text-blue-300' 
                   : 'bg-zinc-900 border-zinc-800 text-zinc-500'
               }`}
             >
               <PenTool className="w-3 h-3 md:w-4 md:h-4 mr-2" />
               {t.sources.user}
             </button>
          </div>
        </div>
      )}
    </>
  );
});

export default ModeSelector;
