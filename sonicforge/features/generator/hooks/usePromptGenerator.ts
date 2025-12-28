
import { useState, useCallback } from 'react';
import { GeneratorState, GeneratedPrompt, GroundingChunk, ExpertInputs, SongConcept } from '../../../types';
import { GeminiService } from '../../../services/ai/GeminiService';
import { useSettings } from '../../../contexts/SettingsContext';
import { StyleComponents } from '../utils/styleBuilder';
import { parseError } from '../../../services/ai/utils';

export const usePromptGenerator = ({ onStateChange }: { onStateChange?: (state: GeneratorState) => void }) => {
  const [state, setState] = useState<GeneratorState>(GeneratorState.IDLE);
  const { lang, isOverclockedMode } = useSettings(); 
  const service = new GeminiService();

  const generate = useCallback(async (
    inputs: SongConcept,
    expertInputs: ExpertInputs,
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    _isOverclockedModeParam: boolean, 
    useGoogleSearch: boolean,
    structuredStyle?: StyleComponents,
  ): Promise<{ success: boolean; result?: GeneratedPrompt; research?: { text: string; sources: GroundingChunk[] }; error?: string }> => {
    setState(GeneratorState.GENERATING);
    onStateChange?.(GeneratorState.GENERATING);

    try {
      service.initialize(inputs, expertInputs, isOverclockedMode, lang);
      const research = await service.gatherIntelligence(useGoogleSearch);
      const res = await service.generate(isExpertMode, lyricSource, structuredStyle);
      
      setState(GeneratorState.COMPLETE);
      onStateChange?.(GeneratorState.COMPLETE);
      return { success: true, result: res, research };
    } catch (e: any) {
      setState(GeneratorState.ERROR);
      onStateChange?.(GeneratorState.ERROR);
      return { success: false, error: parseError(e, lang) };
    }
  }, [isOverclockedMode, lang, onStateChange]);

  const refine = useCallback(async (
    currentResult: GeneratedPrompt | null, 
    instruction: string, 
    isOverclockedMode: boolean,
  ): Promise<{ success: boolean, result?: GeneratedPrompt, error?: string }> => {
    if (!currentResult) return { success: false, error: "No prompt to refine." };
    setState(GeneratorState.GENERATING);
    try {
        service.initialize({} as any, {} as any, isOverclockedMode, lang);
        const refined = await service.refine(currentResult, instruction, lang);
        setState(GeneratorState.COMPLETE);
        return { success: true, result: refined };
    } catch (e: any) {
        setState(GeneratorState.ERROR);
        return { success: false, error: parseError(e, lang) };
    }
  }, [lang]);

  return { generate, refine, state };
};
