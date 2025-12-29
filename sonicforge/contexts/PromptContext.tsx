
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { SongConcept, ExpertInputs, GeneratedPrompt, GenreTemplate, HistoryItem, Platform, AgentType } from '../types';
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
  stemWeights: { 
    vocals: 50, drums: 50, bass: 50, melody: 50,
    guitar: 50, piano: 50, strings: 50, synth: 50,
    fx: 50, texture: 50, percussion: 50, choir: 50
  }
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
  // Consolidated Status State
  activeAgent: AgentType;
  error: string;
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
  activeAgent: 'idle',
  error: ''
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
  | { type: 'SET_STATUS'; payload: { activeAgent: AgentType; error?: string } }
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
              variations: [],
              activeAgent: 'idle',
              error: ''
          } 
      };
    case 'SET_STATUS':
      return {
        ...state,
        present: {
          ...present,
          activeAgent: action.payload.activeAgent,
          error: action.payload.error ?? present.error
        }
      };
    case 'LOAD_HISTORY_ITEM': {
        const item = action.payload;
        const cleanedInputs = { 
            ...DEFAULT_INPUTS,
            ...item.inputs 
        };

        const newPresent: PromptState = {
          ...present,
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
          activeAgent: 'idle',
          error: ''
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

export const usePromptDispatch = () => {
  const context = useContext(PromptDispatchContext);
  if (!context) throw new Error('usePromptDispatch must be used within a PromptProvider');
  return context;
};

/**
 * AUTHORITATIVE HOOK: usePromptBuilder
 * The single source of truth for UI components to interact with prompt logic.
 */
export const usePromptBuilder = () => {
  const state = usePromptState();
  const dispatch = usePromptDispatch();
  const { canUndo, canRedo } = (useContext(PromptContext) as any).history;

  const actions = useMemo(() => ({
    updateInput: (payload: Partial<SongConcept>) => dispatch({ type: 'UPDATE_INPUT', payload }),
    updateExpertInput: (payload: Partial<ExpertInputs>) => dispatch({ type: 'UPDATE_EXPERT_INPUT', payload }),
    setState: (payload: Partial<PromptState>) => dispatch({ type: 'SET_PARTIAL_STATE', payload }),
    setResult: (payload: { result: GeneratedPrompt | null, researchData: any | null }) => dispatch({ type: 'SET_RESULT', payload }),
    setStatus: (payload: { activeAgent: AgentType; error?: string }) => dispatch({ type: 'SET_STATUS', payload }),
    reset: () => dispatch({ type: 'RESET' }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    setMode: (mode: 'custom' | 'general' | 'instrumental' | 'easy') => dispatch({ type: 'UPDATE_INPUT', payload: { mode } }),
    setLyricSource: (lyricSource: 'ai' | 'user') => dispatch({ type: 'SET_PARTIAL_STATE', payload: { lyricSource } }),
    setWorkflow: (workflow: 'forge' | 'alchemy') => dispatch({ type: 'UPDATE_INPUT', payload: { workflow } })
  }), [dispatch]);

  return {
    ...state,
    ...actions,
    canUndo,
    canRedo
  };
};

// Legacy re-exports
export const usePromptInputs = () => usePromptState().inputs;
export const useExpertSettings = () => usePromptState().expertInputs;
export const usePromptActions = () => {
    const { updateInput, updateExpertInput, setState, setResult, reset, undo, redo, setMode, setLyricSource, setWorkflow } = usePromptBuilder();
    return { updateInput, updateExpertInput, setState, setResult, reset, undo, redo, setMode, setLyricSource, setWorkflow };
};
export const usePrompt = usePromptBuilder;
