
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { SongConcept, ExpertInputs, GeneratedPrompt, GenreTemplate, HistoryItem, Platform } from '../types';
import { useHistory } from './HistoryContext';
import { useSettings } from './SettingsContext';

const DEFAULT_INPUTS: SongConcept = {
  platform: 'suno' as Platform,
  mode: 'custom' as 'custom' | 'general' | 'instrumental',
  workflow: 'forge',
  alchemyMode: 'vocals',
  intent: '',
  artistReference: '',
  mood: '',
  instruments: '',
  lyricsInput: '',
  negativePrompt: '',
  lyricsLanguage: '',
  useReMi: false,
  useVowelExtension: false,
  useBackingVocals: false,
  useChords: false
};

const DEFAULT_EXPERT_INPUTS: ExpertInputs = {
  genre: '',
  era: '',
  techAnchor: '',
  bpm: '',
  key: '',
  timeSignature: '',
  structure: [],
  stemWeights: { vocals: 50, drums: 50, bass: 50, melody: 50 } // Default Balanced Mix
};

export type EnhancementLevel = 'light' | 'medium' | 'heavy';

export interface PromptState {
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isExpertMode: boolean;
  lyricSource: 'ai' | 'user';
  result: GeneratedPrompt | null;
  researchData: any | null;
  variations: GeneratedPrompt[];
  useGoogleSearch: boolean;
  isGeneratingVariations: boolean;
  enhancementLevel: EnhancementLevel;
}

const initialState: PromptState = {
  inputs: DEFAULT_INPUTS,
  expertInputs: DEFAULT_EXPERT_INPUTS,
  isExpertMode: false,
  lyricSource: 'ai',
  result: null,
  researchData: null,
  variations: [],
  useGoogleSearch: false,
  isGeneratingVariations: false,
  enhancementLevel: 'medium',
};

interface UndoableState {
  past: PromptState[];
  present: PromptState;
  future: PromptState[];
}

const initialUndoableState: UndoableState = {
  past: [],
  present: initialState,
  future: [],
};

export type Action =
  | { type: 'SET_PARTIAL_STATE'; payload: Partial<PromptState> }
  | { type: 'UPDATE_INPUT'; payload: Partial<SongConcept> }
  | { type: 'UPDATE_EXPERT_INPUT'; payload: Partial<ExpertInputs> }
  | { type: 'SET_RESULT'; payload: { result: GeneratedPrompt | null; researchData: any | null } }
  | { type: 'LOAD_HISTORY_ITEM'; payload: HistoryItem }
  | { type: 'LOAD_TEMPLATE'; payload: { template: GenreTemplate; lang: 'en' | 'pl' } }
  | { type: 'RESET' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const reducer = (state: UndoableState, action: Action): UndoableState => {
  const { past, present, future } = state;

  const updateState = (newPresent: PromptState): UndoableState => {
    if (JSON.stringify(newPresent) === JSON.stringify(present)) return state;
    return {
      past: [...past, present],
      present: newPresent,
      future: [],
    };
  };

  switch (action.type) {
    case 'SET_PARTIAL_STATE':
      return updateState({ ...present, ...action.payload });
    case 'UPDATE_INPUT':
      return updateState({ ...present, inputs: { ...present.inputs, ...action.payload } });
    case 'UPDATE_EXPERT_INPUT':
      return updateState({ ...present, expertInputs: { ...present.expertInputs, ...action.payload } });
    case 'SET_RESULT':
      return { 
          ...state, 
          present: { 
              ...present, 
              result: action.payload.result, 
              researchData: action.payload.researchData, 
              variations: [] 
          } 
      };
    case 'LOAD_HISTORY_ITEM': {
        const item = action.payload;
        const cleanedInputs = { 
            ...DEFAULT_INPUTS,
            ...item.inputs 
        };

        const newPresent: PromptState = {
          inputs: { 
            ...cleanedInputs, 
            lyricsInput: item.inputs.lyricsInput || '', 
            platform: 'suno',
            lyricsLanguage: item.inputs.lyricsLanguage || '',
            useReMi: item.inputs.useReMi || false
          },
          expertInputs: { ...DEFAULT_EXPERT_INPUTS, ...item.expertInputs },
          isExpertMode: item.isExpertMode,
          lyricSource: item.lyricSource,
          result: item.result,
          researchData: item.researchData || null,
          variations: [],
          useGoogleSearch: false,
          isGeneratingVariations: false,
          enhancementLevel: 'medium',
        };
        return { past: [], present: newPresent, future: [] };
    }
    case 'LOAD_TEMPLATE': {
        const { template, lang } = action.payload;
        const templateName = lang === 'pl' ? template.name.pl : template.name.en;
        const newPresent: PromptState = {
            ...initialState,
            inputs: {
                ...DEFAULT_INPUTS,
                platform: 'suno',
                mode: 'custom',
                intent: template.stylePrompt,
                artistReference: templateName,
                useReMi: false
            },
            isExpertMode: true,
            expertInputs: {
                ...DEFAULT_EXPERT_INPUTS,
                genre: templateName,
                structure: template.commonStructure.map(type => ({ id: crypto.randomUUID(), type, modifiers: [] })),
                bpm: `${template.bpmRange[0]}-${template.bpmRange[1]}`,
                key: template.recommendedKeys[0] || '',
            },
        };
        return { past: [], present: newPresent, future: [] };
    }
    case 'RESET':
      return { past: [], present: initialState, future: [] };
    case 'UNDO':
      if (past.length === 0) return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future],
      };
    case 'REDO':
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
    default:
      return state;
  }
};

const PromptContext = createContext<{ state: PromptState; history: { canUndo: boolean; canRedo: boolean } } | undefined>(undefined);
const PromptDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialUndoableState);
  const { loadedItem, loadedTemplate, resetLoaders } = useHistory();
  const { lang } = useSettings();

  useEffect(() => {
    if (loadedItem) {
      dispatch({ type: 'LOAD_HISTORY_ITEM', payload: loadedItem });
      resetLoaders();
    }
  }, [loadedItem, resetLoaders]);

  useEffect(() => {
    if (loadedTemplate) {
      dispatch({ type: 'LOAD_TEMPLATE', payload: { template: loadedTemplate, lang } });
      resetLoaders();
    }
  }, [loadedTemplate, lang, resetLoaders]);

  const contextValue = useMemo(() => ({
    state: state.present,
    history: { canUndo: state.past.length > 0, canRedo: state.future.length > 0 }
  }), [state.present, state.past.length, state.future.length]);

  return (
    <PromptDispatchContext.Provider value={dispatch}>
      <PromptContext.Provider value={contextValue}>
        {children}
      </PromptContext.Provider>
    </PromptDispatchContext.Provider>
  );
};

export const usePromptState = () => {
  const context = useContext(PromptContext);
  if (!context) throw new Error('usePromptState must be used within a PromptProvider');
  return context.state;
};
export const usePromptInputs = () => usePromptState().inputs;
export const useExpertSettings = () => usePromptState().expertInputs;
export const usePromptHistoryInfo = () => {
  const context = useContext(PromptContext);
  if (!context) throw new Error('usePromptHistoryInfo must be used within a PromptProvider');
  return context.history;
}
export const usePromptDispatch = () => {
  const context = useContext(PromptDispatchContext);
  if (!context) throw new Error('usePromptDispatch must be used within a PromptProvider');
  return context;
};

export const usePromptActions = () => {
  const dispatch = usePromptDispatch();

  const updateInput = useCallback((payload: Partial<SongConcept>) => {
    dispatch({ type: 'UPDATE_INPUT', payload });
  }, [dispatch]);

  const updateExpertInput = useCallback((payload: Partial<ExpertInputs>) => {
    dispatch({ type: 'UPDATE_EXPERT_INPUT', payload });
  }, [dispatch]);

  const setState = useCallback((payload: Partial<PromptState>) => {
    dispatch({ type: 'SET_PARTIAL_STATE', payload });
  }, [dispatch]);

  const setResult = useCallback((payload: { result: GeneratedPrompt | null, researchData: any | null }) => {
    dispatch({ type: 'SET_RESULT', payload });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  // Convenience Methods
  const setPlatform = useCallback((platform: Platform) => {
    updateInput({ platform });
  }, [updateInput]);

  const setMode = useCallback((mode: 'custom' | 'general' | 'instrumental' | 'easy') => {
    updateInput({ mode });
  }, [updateInput]);

  const setWorkflow = useCallback((workflow: 'forge' | 'alchemy') => {
    updateInput({ workflow });
  }, [updateInput]);

  const setLyricSource = useCallback((lyricSource: 'ai' | 'user') => {
    setState({ lyricSource });
  }, [setState]);

  return {
    updateInput,
    updateExpertInput,
    setState,
    setResult,
    reset,
    undo,
    redo,
    setPlatform,
    setMode,
    setWorkflow,
    setLyricSource
  };
};

export const usePrompt = () => {
  const state = usePromptState();
  const { canUndo, canRedo } = usePromptHistoryInfo();
  const actions = usePromptActions(); // Use actions internally or just return dispatch based
  
  return {
    ...state,
    ...actions,
    canUndo, 
    canRedo 
  };
};
