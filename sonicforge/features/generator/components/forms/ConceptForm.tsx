
import React, { memo, useCallback } from 'react';
import { BuilderTranslation } from '../../../../types';
import DraftHealth from '../DraftHealth';
import ConceptInput from '../inputs/ConceptInput';
import SmartSuggestions from '../SmartSuggestions';
import { usePromptInputs, useExpertSettings } from '../../../../contexts';
import { usePromptActions } from '../../hooks/usePromptActions';
import { Suggestion } from '../../utils/suggestionEngine';

interface ConceptFormProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const ConceptForm: React.FC<ConceptFormProps> = memo(({ t, isPyriteMode }) => {
  const inputs = usePromptInputs();
  const expertInputs = useExpertSettings();
  const { updateInput } = usePromptActions();

  const handleAddSuggestion = useCallback((suggestion: Suggestion) => {
      if (suggestion.type === 'instrument') {
          const current = inputs.instruments ? inputs.instruments.split(', ').filter(Boolean) : [];
          if (!current.includes(suggestion.value)) {
              updateInput({ instruments: [...current, suggestion.value].join(', ') });
          }
      } else if (suggestion.type === 'mood') {
          const current = inputs.mood ? inputs.mood.split(', ').filter(Boolean) : [];
          if (!current.includes(suggestion.value)) {
              updateInput({ mood: [...current, suggestion.value].join(', ') });
          }
      } else if (suggestion.type === 'meta') {
          updateInput({ lyricsInput: (inputs.lyricsInput || '') + '\n' + suggestion.value });
      } else if (suggestion.type === 'general') {
          updateInput({ intent: (inputs.intent || '') + ', ' + suggestion.value });
      }
  }, [inputs, updateInput]);

  return (
    <div className="space-y-4">
        {/* DRAFT HEALTH INDICATOR */}
        <DraftHealth 
            inputs={inputs} 
            expertInputs={expertInputs} 
            isPyriteMode={isPyriteMode} 
        />

        <ConceptInput t={t} isPyriteMode={isPyriteMode} />

        {/* Smart Suggestions Integration */}
        <SmartSuggestions 
            genres={expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : []}
            mood={inputs.mood}
            instruments={inputs.instruments}
            vocals={expertInputs.vocalStyle || ''}
            intent={inputs.intent}
            onAddSuggestion={handleAddSuggestion}
            isPyriteMode={isPyriteMode}
            mode={inputs.mode}
        />
    </div>
  );
});

export default ConceptForm;
