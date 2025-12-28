
import React, { memo, useCallback } from 'react';
import { BuilderTranslation } from '../../../../types';
import MoodSelector from '../inputs/MoodSelector';
import InstrumentPicker from '../inputs/InstrumentPicker';
import VocalPicker from '../inputs/VocalPicker';
import NegativePromptInput from '../inputs/NegativePromptInput';
import { usePromptState } from '../../../../contexts';
import { usePromptActions } from '../../hooks/usePromptActions';

interface VibeFormProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const VibeForm: React.FC<VibeFormProps> = memo(({ t, isPyriteMode }) => {
  const { inputs, expertInputs } = usePromptState();
  const { updateInput, updateExpertInput } = usePromptActions();

  const handleSetMood = useCallback((val: string) => updateInput({ mood: val }), [updateInput]);
  const handleSetInstruments = useCallback((val: string) => updateInput({ instruments: val }), [updateInput]);
  const handleSetVocals = useCallback((val: string) => updateExpertInput({ vocalStyle: val }), [updateExpertInput]);
  const handleSetNegativePrompt = useCallback((val: string) => updateInput({ negativePrompt: val }), [updateInput]);

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MoodSelector 
                mood={inputs.mood}
                setMood={handleSetMood}
                t={t}
                isPyriteMode={isPyriteMode}
                genre={expertInputs.genre}
            />
            <InstrumentPicker 
                instruments={inputs.instruments}
                setInstruments={handleSetInstruments}
                t={t}
                isPyriteMode={isPyriteMode}
                genre={expertInputs.genre}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VocalPicker 
                vocals={expertInputs.vocalStyle || ''}
                setVocals={handleSetVocals}
                t={t}
                isPyriteMode={isPyriteMode}
                genre={expertInputs.genre}
            />
            {/* Spacer or future input */}
            <div className="hidden md:block" /> 
        </div>

        <NegativePromptInput 
            value={inputs.negativePrompt || ''}
            onChange={handleSetNegativePrompt}
            isPyriteMode={isPyriteMode}
            t={t}
        />
    </div>
  );
});

export default VibeForm;
