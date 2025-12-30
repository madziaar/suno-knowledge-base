
import { useReducer, useCallback, useRef, useEffect } from 'react';
import { GeneratorState, GeneratedPrompt, GroundingChunk, ExpertInputs, SongConcept, AgentType, Platform } from '../../../types';
import { GeminiService } from '../../../services/ai/GeminiService';
import { StyleComponents } from '../utils/styleBuilder';
import { useSettings } from '../../../contexts/SettingsContext';

// State Definitions for the hook's process
interface HookState {
  status: GeneratorState;
  researchData: { text: string; sources: GroundingChunk[] } | null;
  error: string;
  activeAgent: AgentType;
}

type Action =
  | { type: 'START_RESEARCH' }
  | { type: 'RESEARCH_COMPLETE'; payload: { text: string; sources: GroundingChunk[] } | null }
  | { type: 'START_GENERATION' }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'SET_AGENT'; payload: AgentType };

const initialState: HookState = {
  status: GeneratorState.IDLE,
  researchData: null,
  error: '',
  activeAgent: 'idle'
};

const reducer = (state: HookState, action: Action): HookState => {
  switch (action.type) {
    case 'START_RESEARCH':
      return { ...state, status: GeneratorState.RESEARCHING, error: '', activeAgent: 'researcher' };
    case 'RESEARCH_COMPLETE':
      return { ...state, researchData: action.payload };
    case 'START_GENERATION':
      return { ...state, status: GeneratorState.ANALYZING, error: '' };
    case 'COMPLETE':
      return { ...state, status: GeneratorState.COMPLETE, activeAgent: 'idle' };
    case 'ERROR':
      return { ...state, status: GeneratorState.ERROR, error: action.payload, activeAgent: 'idle' };
    case 'RESET':
      return initialState;
    case 'SET_AGENT':
      return { ...state, activeAgent: action.payload };
    default:
      return state;
  }
};

interface UsePromptGeneratorProps {
    onStateChange?: (state: GeneratorState) => void;
}

export const usePromptGenerator = ({ onStateChange }: UsePromptGeneratorProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isMounted = useRef(true);
  const { lang, isPyriteMode } = useSettings(); 
  
  // Instance of the service
  const service = useRef(new GeminiService());

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    onStateChange?.(state.status);
  }, [state.status, onStateChange]);

  const generate = useCallback(async (
    inputs: SongConcept,
    expertInputs: ExpertInputs,
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    // isPyriteMode param is now redundant here as we have it from context, but keeping signature compatible if needed
    _isPyriteModeParam: boolean, 
    useGoogleSearch: boolean,
    structuredStyle?: StyleComponents,
    forcedStructure?: string // NEW: Automated Studio Logic
  ): Promise<{ success: boolean; result?: GeneratedPrompt; research?: any; error?: string }> => {
    dispatch({ type: 'RESET' });

    try {
      // 1. Initialize Service with current context
      const localizedInputs = { ...inputs, targetLanguage: lang };
      // Use the service ref to maintain instance but re-init context
      service.current.initialize(localizedInputs, expertInputs, isPyriteMode);

      // 2. Gather Intelligence
      dispatch({ type: 'START_RESEARCH' });
      const research = await service.current.gatherIntelligence(useGoogleSearch);
      
      if (isMounted.current) {
          dispatch({ type: 'RESEARCH_COMPLETE', payload: research });
      }

      if (!isMounted.current) return { success: false, error: 'Unmounted' };
      dispatch({ type: 'START_GENERATION' });

      // 3. Execute Generation
      const genResult = await service.current.generate(
        isExpertMode,
        lyricSource,
        structuredStyle,
        undefined, // Stream callback removed for simplicity in this refactor
        (agent) => { if (isMounted.current) dispatch({ type: 'SET_AGENT', payload: agent }); },
        forcedStructure // Pass down the automation param
      );

      if (isMounted.current) {
        dispatch({ type: 'COMPLETE' });
        return { success: true, result: genResult, research };
      }
      return { success: false, error: 'Unmounted' };

    } catch (e: unknown) {
      if (isMounted.current) {
        const msg = e instanceof Error ? e.message : "Unknown error.";
        dispatch({ type: 'ERROR', payload: msg });
        return { success: false, error: msg };
      }
      return { success: false, error: 'Unmounted' };
    }
  }, [lang, isPyriteMode]);

  const refine = useCallback(async (
    currentResult: GeneratedPrompt | null, 
    instruction: string, 
    // Params below kept for signature compatibility but used from context/service
    _isPyriteModeParam: boolean, 
    platform: Platform = 'suno',
    lyricsLanguage?: string 
  ): Promise<{ success: boolean, result?: GeneratedPrompt, error?: string }> => {
    if (!currentResult) return { success: false, error: "No result to refine." };
    
    dispatch({ type: 'START_GENERATION' });
    dispatch({ type: 'SET_AGENT', payload: 'refiner' });
    
    try {
        const refinedResult = await service.current.refine(
            currentResult, 
            instruction, 
            lang, 
            lyricsLanguage
        );

        if (isMounted.current) {
            dispatch({ type: 'COMPLETE' });
            return { success: true, result: refinedResult };
        }
        return { success: false, error: "Unmounted" };
    } catch (e: unknown) {
        if (isMounted.current) {
            const msg = e instanceof Error ? e.message : "Refinement failed.";
            dispatch({ type: 'ERROR', payload: msg });
            return { success: false, error: msg };
        }
        return { success: false, error: "Unmounted" };
    }
  }, [lang]);

  return { 
    state: state.status, 
    error: state.error, 
    activeAgent: state.activeAgent,
    generate, 
    refine,
  };
};
