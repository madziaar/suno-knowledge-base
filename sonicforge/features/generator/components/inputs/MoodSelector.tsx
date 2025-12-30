
import React, { memo } from 'react';
import Tooltip from '../../../../components/Tooltip';
import SuggestionInput from '../../../../components/shared/SuggestionInput';
import { MOODS } from '../../data/autocompleteData';
import { BuilderTranslation } from '../../../../types';
import { cn } from '../../../../lib/utils';

interface MoodSelectorProps {
  mood: string;
  setMood: (val: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  onFocus?: (e: any) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = memo(({ mood, setMood, t, isPyriteMode, onFocus }) => {
  return (
    <div className="relative z-30">
      <div className="flex items-center mb-2 h-5">
         <div className="flex items-center">
           <label className={cn(
             "text-[10px] font-bold uppercase tracking-widest mr-1.5 transition-colors",
             isPyriteMode ? 'text-purple-300/80' : 'text-zinc-500'
           )}>
             {t.moodLabel}
           </label>
           <Tooltip content={t.tooltips.mood} />
         </div>
      </div>
      <SuggestionInput
         value={mood}
         onChange={setMood}
         options={MOODS}
         variant={isPyriteMode ? 'pyrite' : 'default'}
         onFocus={onFocus}
         placeholder={t.moodPlaceholder}
      />
    </div>
  );
});

export default MoodSelector;
