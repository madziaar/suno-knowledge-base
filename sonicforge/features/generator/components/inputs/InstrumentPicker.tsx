
import React, { memo, useMemo } from 'react';
import Tooltip from '../../../../components/Tooltip';
import SuggestionInput from '../../../../components/shared/SuggestionInput';
import { BuilderTranslation, Platform } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { suggestInstruments } from '../../utils/suggestionEngine';

interface InstrumentPickerProps {
  instruments: string;
  setInstruments: (val: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  onFocus?: (e: any) => void;
  platform?: Platform;
  intent?: string; // Kept for interface compatibility but not strictly used in new engine logic if not passed
  mood?: string;
  genre?: string;
}

const InstrumentPicker: React.FC<InstrumentPickerProps> = memo(({ 
  instruments, setInstruments, t, isPyriteMode, onFocus, platform = 'suno', intent, mood, genre 
}) => {

  const suggestedInstruments = useMemo(() => {
    const genreList = genre ? genre.split(',').map(s => s.trim()) : [];
    // If no genre from expert inputs, try to infer from intent (naive check) if needed, 
    // but the engine handles empty lists gracefully.
    return suggestInstruments(genreList, mood);
  }, [genre, mood]);

  return (
    <div className="relative z-20">
      <div className="flex items-center justify-between mb-2 h-5">
         <div className="flex items-center">
           <label className={cn(
             "text-[10px] font-bold uppercase tracking-widest mr-1.5 transition-colors",
             isPyriteMode ? 'text-purple-300/80' : 'text-zinc-500'
           )}>
             {t.instrumentsLabel}
           </label>
           <Tooltip content={t.tooltips.instrument} />
         </div>
         <span className={cn(
           "text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold tracking-tight",
           isPyriteMode 
             ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' 
             : 'bg-yellow-900/10 border-yellow-500/30 text-yellow-600'
         )}>
            AUTO-SUGGEST
         </span>
      </div>
      <SuggestionInput
         value={instruments}
         onChange={setInstruments}
         options={suggestedInstruments}
         variant={isPyriteMode ? 'pyrite' : 'default'}
         onFocus={onFocus}
         placeholder={t.instrumentsPlaceholder}
      />
    </div>
  );
});

export default InstrumentPicker;
