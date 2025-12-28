
import React, { memo, useMemo } from 'react';
import Tooltip from '../../../../components/Tooltip';
import TagInput from '../../../../components/shared/TagInput';
import { BuilderTranslation } from '../../../../types';
import { suggestVocalsForGenre, VOCAL_DESCRIPTORS } from '../../data/vocalDatabase';

interface VocalPickerProps {
  vocals: string;
  setVocals: (val: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  genre?: string;
}

const VocalPicker: React.FC<VocalPickerProps> = memo(({ 
  vocals, setVocals, t, isPyriteMode, genre 
}) => {

  const categorizedSuggestions = useMemo(() => {
    // Get primary genre from comma separated list
    const primaryGenre = genre?.split(',')[0].trim() || '';
    
    // Get genre-specific vocal suggestions
    const primary = suggestVocalsForGenre(primaryGenre);
    
    // Fill 'other' with standard vocal descriptors excluding duplicates and primary matches
    const other = VOCAL_DESCRIPTORS.filter(v => !primary.includes(v));

    return { primary, secondary: [], other };
  }, [genre]);

  return (
    <div className="relative">
      <TagInput
         label={t.expert?.categories?.vocals || "Vocal Style"}
         value={vocals}
         onChange={setVocals}
         suggestions={categorizedSuggestions}
         isPyriteMode={isPyriteMode}
         placeholder="e.g. Ethereal Female, Aggressive Male..."
      />
      <div className="absolute top-0 right-0 -mt-1">
        <Tooltip content={t.tooltips.vocalStyle} />
      </div>
    </div>
  );
});

export default VocalPicker;
