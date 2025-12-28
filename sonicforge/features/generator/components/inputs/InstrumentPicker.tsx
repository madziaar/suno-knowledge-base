
import React, { memo, useMemo } from 'react';
import Tooltip from '../../../../components/Tooltip';
import TagInput from '../../../../components/shared/TagInput';
import { BuilderTranslation } from '../../../../types';
import { GENRE_INSTRUMENT_MAP, INSTRUMENTS_SUNO } from '../../data/autocompleteData';

interface InstrumentPickerProps {
  instruments: string;
  setInstruments: (val: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  genre?: string;
}

const InstrumentPicker: React.FC<InstrumentPickerProps> = memo(({ 
  instruments, setInstruments, t, isPyriteMode, genre 
}) => {

  const categorizedSuggestions = useMemo(() => {
    // Get primary genre from comma separated list
    const primaryGenre = genre?.split(',')[0].trim() || '';
    
    // Attempt fuzzy match on genre map
    const mapMatch = GENRE_INSTRUMENT_MAP[primaryGenre] || 
                     Object.entries(GENRE_INSTRUMENT_MAP).find(([key]) => primaryGenre.toLowerCase().includes(key.toLowerCase()))?.[1];

    const primary = mapMatch?.primary || [];
    const secondary = mapMatch?.secondary || [];
    
    // Fill 'other' with standard instruments excluding duplicates
    const other = INSTRUMENTS_SUNO.filter(i => !primary.includes(i) && !secondary.includes(i));

    return { primary, secondary, other };
  }, [genre]);

  return (
    <div className="relative">
      <TagInput
         label={t.instrumentsLabel}
         value={instruments}
         onChange={setInstruments}
         suggestions={categorizedSuggestions}
         isPyriteMode={isPyriteMode}
         placeholder={t.instrumentsPlaceholder}
      />
      <div className="absolute top-0 right-0 -mt-1">
        <Tooltip content={t.tooltips.instrument} />
      </div>
    </div>
  );
});

export default InstrumentPicker;
