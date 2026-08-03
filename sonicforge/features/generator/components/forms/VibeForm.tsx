
import React, { memo, useCallback } from 'react';
import { BuilderTranslation } from '../../../../types';
import MoodSelector from '../inputs/MoodSelector';
import InstrumentPicker from '../inputs/InstrumentPicker';
import NegativePromptInput from '../inputs/NegativePromptInput';
import { usePromptState } from '../../../../contexts';
import { usePromptActions } from '../../hooks/usePromptActions';

interface VibeFormProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const VibeForm: React.FC<VibeFormProps> = memo(({ t, isPyriteMode }) => {
  const { inputs, expertInputs } = usePromptState();
  const { updateInput } = usePromptActions();

  const handleSetMood = useCallback((val: string) => updateInput({ mood: val }), [updateInput]);
  const handleSetInstruments = useCallback((val: string) => updateInput({ instruments: val }), [updateInput]);
  const handleSetNegativePrompt = useCallback((val: string) => updateInput({ negativePrompt: val }), [updateInput]);

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <MoodSelector 
                mood={inputs.mood}
                setMood={handleSetMood}
                t={t}
                isPyriteMode={isPyriteMode}
            />
            <InstrumentPicker 
                instruments={inputs.instruments}
                setInstruments={handleSetInstruments}
                t={t}
                isPyriteMode={isPyriteMode}
                intent={inputs.intent}
                mood={inputs.mood}
                genre={expertInputs.genre}
            />
        </div>

        <NegativePromptInput 
            value={inputs.negativePrompt || ''}
            onChange={handleSetNegativePrompt}
            isPyriteMode={isPyriteMode}
        />
    </div>
  );
});

export default VibeForm;
