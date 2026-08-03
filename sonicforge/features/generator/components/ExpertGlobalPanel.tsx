
import React, { memo } from 'react';
import { Globe, Settings2 } from 'lucide-react';
import SuggestionInput from '../../../../components/shared/SuggestionInput';
import BpmTapper from '../../../../components/shared/BpmTapper';
import { ExpertInputs, BuilderTranslation } from '../../../types';
import { GENRES, ERAS, BPMS, KEYS, TIME_SIGNATURES } from '../data/autocompleteData';
import GenrePicker from './inputs/GenrePicker'; // Import the new component
import GenreOptimizationTips from './GenreOptimizationTips';

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
         
         {/* Genre Optimization Tips */}
         {expertInputs.genre && (
             <GenreOptimizationTips genre={expertInputs.genre} isPyriteMode={isPyriteMode} />
         )}

         <div className="grid grid-cols-2 gap-4">
             <div>
               <SuggestionInput 
                 label={t.expert.era}
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
               <label className={`text-[10px] ${isPyriteMode ? 'text-purple-300/70' : 'text-zinc-500'} mb-1.5 block font-bold uppercase tracking-wider`}>
                 {t.expert.tech}
               </label>
               <input 
                 value={expertInputs.techAnchor}
                 onChange={e => setExpertInputs(p => ({...p, techAnchor: e.target.value}))}
                 className={`w-full bg-zinc-900/50 border rounded px-3 py-2 text-xs md:text-sm text-zinc-200 outline-none transition-colors ${isPyriteMode ? 'bg-black/40 border-purple-500/30 focus:border-purple-400' : 'border-zinc-800 focus:border-yellow-500'}`}
                 placeholder="e.g. Roland Juno-106, Gated Reverb"
               />
             </div>
         </div>
      </div>
    </div>
  );
});

export default ExpertGlobalPanel;
