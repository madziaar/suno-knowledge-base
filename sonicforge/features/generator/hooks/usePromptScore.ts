
import { useMemo } from 'react';
import { usePromptBuilder } from '../../../contexts/PromptContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { validateSunoPrompt, assembleStylePrompt } from '../utils';
import { GeneratedPrompt, PromptQualityScore } from '../../../types';

/**
 * usePromptScore
 * Performs a real-time validation audit on the current builder state.
 */
export const usePromptScore = (): PromptQualityScore => {
  const { inputs, expertInputs } = usePromptBuilder();
  const { lang } = useSettings();

  return useMemo(() => {
    // 1. Construct a 'Virtual Style' from current inputs to simulate the final output
    const virtualStyle = assembleStylePrompt({
      genres: expertInputs.genre ? expertInputs.genre.split(',').map(s => s.trim()) : [],
      subGenres: [],
      moods: inputs.mood ? inputs.mood.split(',').map(s => s.trim()) : [],
      vocals: expertInputs.vocalStyle ? [expertInputs.vocalStyle] : [],
      bpm: expertInputs.bpm,
      key: expertInputs.key,
      instruments: inputs.instruments ? inputs.instruments.split(',').map(s => s.trim()) : [],
      atmosphere: expertInputs.atmosphereStyle ? expertInputs.atmosphereStyle.split(',').map(s => s.trim()) : [],
      production: expertInputs.techAnchor ? [expertInputs.techAnchor] : [],
      influences: inputs.artistReference ? [inputs.artistReference] : [],
      era: expertInputs.era
    });

    const mockPrompt: GeneratedPrompt = {
      title: '',
      tags: virtualStyle,
      style: virtualStyle,
      lyrics: inputs.lyricsInput || '',
      analysis: ''
    };

    // 2. Pass to the Suno Validator
    return validateSunoPrompt(mockPrompt, lang);
  }, [inputs, expertInputs, lang]);
};
