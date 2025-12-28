
import React, { memo, useMemo } from 'react';
import Tooltip from '../../../../components/Tooltip';
import TagInput from '../../../../components/shared/TagInput';
import { MOODS, GENRE_MOOD_MAP } from '../../data/autocompleteData';
import { BuilderTranslation } from '../../../../types';

interface MoodSelectorProps {
  mood: string;
  setMood: (val: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  genre?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = memo(({ mood, setMood, t, isPyriteMode, genre }) => {
  
  const categorizedSuggestions = useMemo(() => {
    const primaryGenre = genre?.split(',')[0].trim() || '';
    const genreSuggestions = GENRE_MOOD_MAP[primaryGenre] || 
                             Object.entries(GENRE_MOOD_MAP).find(([key]) => primaryGenre.toLowerCase().includes(key.toLowerCase()))?.[1] || 
                             [];

    // In Moods, we use genre suggestions as primary
    const other = MOODS.filter(m => !genreSuggestions.includes(m));

    return {
      primary: genreSuggestions,
      secondary: [], 
      other
    };
  }, [genre]);

  return (
    <div className="relative">
      <TagInput
         label={t.moodLabel}
         value={mood}
         onChange={setMood}
         suggestions={categorizedSuggestions}
         isPyriteMode={isPyriteMode}
         placeholder={t.moodPlaceholder}
      />
      <div className="absolute top-0 right-0 -mt-1">
        <Tooltip content={t.tooltips.mood} />
      </div>
    </div>
  );
});

export default MoodSelector;
