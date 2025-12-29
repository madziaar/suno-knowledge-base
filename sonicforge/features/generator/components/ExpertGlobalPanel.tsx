
import React, { memo } from 'react';
import { Globe, Settings2, Clock } from 'lucide-react';
import SuggestionInput from '../../../../components/shared/SuggestionInput';
import BpmTapper from '../../../../components/shared/BpmTapper';
import { ExpertInputs, BuilderTranslation } from '../../../types';
import { GENRES, ERAS, BPMS, KEYS, TIME_SIGNATURES } from '../data/autocompleteData';
import GenrePicker from './inputs/GenrePicker';
import GenreOptimizationTips from './GenreOptimizationTips';
import Tooltip from '../../../components/Tooltip';
import { cn } from '../../../lib/utils';
import { Slider } from '../../../../components/ui/Slider';

interface ExpertGlobalPanelProps {
  expertInputs: ExpertInputs;
  setExpertInputs: React.Dispatch<React.SetStateAction<ExpertInputs>>;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const ExpertGlobalPanel: React.FC<ExpertGlobalPanelProps> = memo(({
  expertInputs,
  setExpertInputs,
  isPyriteMode,
  t
}) => {
  const duration = expertInputs.duration || 180; // default 3 mins

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 rounded-xl border ${isPyriteMode ? 'border-purple-500/40 bg-purple-900/10' : 'border-purple-500/30 bg-purple-900/10'} shadow-lg`}>
      <div className="flex items-center mb-4 pb-2 border-b border-purple-500/20">
        <Globe className="w-4 h-4 mr-2 text-purple-400" />
        <label className="text-xs font-bold text-purple-200 uppercase tracking-wider">{t.globalVars}</label>
      </div>
      
      <div className="space-y-4">
         <GenrePicker 
            value={expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : []}
            onChange={genres => setExpertInputs(p => ({...p, genre: genres.join(', ')}))}
            isPyriteMode={isPyriteMode}
            t={t}
         />
         
         {expertInputs.genre && (
             <GenreOptimizationTips genre={expertInputs.genre} isPyriteMode={isPyriteMode} />
         )}

         <div className="grid grid-cols-2 gap-4">
             <div>
               <SuggestionInput 
                 label={t.expert.era}
                 tooltipContent={t.tooltips.era}
                 value={expertInputs.era}
                 onChange={val => setExpertInputs(p => ({...p, era: val}))}
                 options={ERAS}
                 variant={isPyriteMode ? 'pyrite' : 'default'}
                 placeholder="e.g. 1980s"
                 className={isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : ''}
               />
             </div>
             <div className="relative">
               <SuggestionInput 
                 label={t.expert.bpm}
                 tooltipContent={t.tooltips.bpm}
                 value={expertInputs.bpm}
                 onChange={val => setExpertInputs(p => ({...p, bpm: val}))}
                 options={BPMS}
                 variant={isPyriteMode ? 'pyrite' : 'default'}
                 placeholder="120"
                 className={isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : ''}
               />
               <div className="absolute top-6 right-1">
                 <BpmTapper 
                   onBpmChange={(bpm) => setExpertInputs(p => ({...p, bpm}))} 
                   variant={isPyriteMode ? 'pyrite' : 'default'}
                 />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <SuggestionInput 
                    label={t.expert.key}
                    tooltipContent={t.tooltips.key}
                    value={expertInputs.key}
                    onChange={val => setExpertInputs(p => ({...p, key: val}))}
                    options={KEYS}
                    variant={isPyriteMode ? 'pyrite' : 'default'}
                    placeholder="C Min"
                    className={isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : ''}
                />
                <SuggestionInput 
                    label={t.expert.timeSig || "Time Sig"}
                    value={expertInputs.timeSignature || ''}
                    onChange={val => setExpertInputs(p => ({...p, timeSignature: val}))}
                    options={TIME_SIGNATURES}
                    variant={isPyriteMode ? 'pyrite' : 'default'}
                    placeholder="4/4"
                    className={isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : ''}
                />
             </div>
             <div>
               <label className={`text-[10px] ${isPyriteMode ? 'text-purple-300/70' : 'text-zinc-500'} mb-1.5 block font-bold uppercase tracking-wider flex items-center`}>
                 {t.expert.tech}
                 <Tooltip content={t.tooltips.techAnchor} />
               </label>
               <input 
                 value={expertInputs.techAnchor}
                 onChange={e => setExpertInputs(p => ({...p, techAnchor: e.target.value}))}
                 className={`w-full bg-zinc-900/50 border rounded px-3 py-2 text-xs md:text-sm text-zinc-200 outline-none transition-colors ${isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : 'border-zinc-800 focus:border-yellow-500'}`}
                 placeholder="e.g. Roland Juno-106, Gated Reverb"
               />
             </div>
         </div>
         
         {/* Duration Slider for v4.5+ */}
         <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
                <label className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", isPyriteMode ? 'text-purple-300/70' : 'text-zinc-500')}>
                    <Clock className="w-3 h-3" />
                    Target Duration (v4.5+)
                </label>
                <span className={cn("text-xs font-mono", isPyriteMode ? "text-purple-300" : "text-white")}>
                    {formatTime(duration)}
                </span>
            </div>
            <Slider 
                value={duration} 
                min={60} 
                max={480} 
                step={30} 
                onChange={(val) => setExpertInputs(p => ({ ...p, duration: val }))} 
                isPyrite={isPyriteMode} 
            />
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono mt-1 px-1">
                <span>1:00</span>
                <span>2:00</span>
                <span>3:00</span>
                <span>4:00 (v4)</span>
                <span>6:00</span>
                <span>8:00 (v5)</span>
            </div>
         </div>
      </div>
    </div>
  );
});

export default ExpertGlobalPanel;
