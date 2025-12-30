
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { SongConcept, ExpertInputs, GeneratedPrompt, GenreTemplate, HistoryItem, Platform } from '../types';
import { useHistory } from './HistoryContext';
import { useSettings } from './SettingsContext';

// --- STATE & TYPES ---

const DEFAULT_INPUTS: SongConcept = {
  platform: 'suno' as Platform,
  mode: 'custom' as 'custom' | 'general' | 'instrumental',
  workflow: 'forge',
  alchemyMode: 'inspire',
  intent: '',
  artistReference: '',
  mood: '',
  instruments: '',
  lyricsInput: '',
  negativePrompt: '',
  playlistUrl: '',
  lyricsLanguage: '' // Default to auto/empty
};

const DEFAULT_EXPERT_INPUTS: ExpertInputs = {
  genre: '',
  era: '',
  techAnchor: '',
  bpm: '',
  key: '',
  timeSignature: '',
  structure: [],
  customPersona: '',
  isRawMode: false,
  aiModel: 'gemini-3-pro'
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
  useReMi: boolean;
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
  useReMi: false,
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

// --- REDUCER ---

const reducer = (state: UndoableState, action: Action): UndoableState => {
  const { past, present, future } = state;

  const updateState = (newPresent: PromptState): UndoableState => {
    // Basic equality check to prevent history spam for identical updates
    if (JSON.stringify(newPresent) === JSON.stringify(present)) return state;
    return {
      past: [...past, present],
      present: newPresent,
      future: [],
    };
  };

  switch (action.type) {
    case 'SET_PARTIAL_STATE': {
      return updateState({ ...present, ...action.payload });
    }
    case 'UPDATE_INPUT': {
      return updateState({ ...present, inputs: { ...present.inputs, ...action.payload } });
    }
    case 'UPDATE_EXPERT_INPUT': {
      return updateState({ ...present, expertInputs: { ...present.expertInputs, ...action.payload } });
    }
    case 'SET_RESULT': {
      // Results are not undoable history states in the same way inputs are, 
      // but we update the present state. 
      // Do NOT push to history for result generation to avoid "Undo" removing the result immediately.
      return { 
          ...state, 
          present: { 
              ...present, 
              result: action.payload.result, 
              researchData: action.payload.researchData, 
              variations: [] 
          } 
      };
    }
    case 'LOAD_HISTORY_ITEM': {
        const item = action.payload;
        const newPresent: PromptState = {
          inputs: { 
            ...item.inputs, 
            lyricsInput: item.inputs.lyricsInput || '', 
            platform: 'suno',
            workflow: item.inputs.workflow || 'forge',
            alchemyMode: item.inputs.alchemyMode || 'inspire',
            playlistUrl: item.inputs.playlistUrl || '',
            lyricsLanguage: item.inputs.lyricsLanguage || ''
          },
          expertInputs: { ...DEFAULT_EXPERT_INPUTS, ...item.expertInputs },
          isExpertMode: item.isExpertMode,
          lyricSource: item.lyricSource,
          result: item.result,
          researchData: item.researchData || null,
          variations: [],
          useGoogleSearch: false,
          isGeneratingVariations: false,
          useReMi: false,
          enhancementLevel: 'medium', // Default for loaded items
        };
        // Reset history on load
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
    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
    default:
      return state;
  }
};

// --- CONTEXT SPLITTING ---

// 1. State Context Value Wrapper
interface PromptContextValue {
  state: PromptState;
  history: {
    canUndo: boolean;
    canRedo: boolean;
  };
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

// 2. Dispatch Context
const PromptDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// --- PROVIDER ---

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialUndoableState);
  const { loadedItem, loadedTemplate, resetLoaders } = useHistory();
  const { lang } = useSettings();

  // History / Template Loading Side Effects
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
    history: {
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0
    }
  }), [state.present, state.past.length, state.future.length]);

  return (
    <PromptDispatchContext.Provider value={dispatch}>
      <PromptContext.Provider value={contextValue}>
        {children}
      </PromptContext.Provider>
    </PromptDispatchContext.Provider>
  );
};

// --- HOOKS ---

export const usePromptState = () => {
  const context = useContext(PromptContext);
  if (context === undefined) throw new Error('usePromptState must be used within a PromptProvider');
  return context.state;
};

// --- OPTIMIZED SELECTOR HOOKS ---

export const usePromptInputs = () => {
  const context = useContext(PromptContext);
  if (context === undefined) throw new Error('usePromptInputs must be used within a PromptProvider');
  return context.state.inputs;
};

export const useExpertSettings = () => {
  const context = useContext(PromptContext);
  if (context === undefined) throw new Error('useExpertSettings must be used within a PromptProvider');
  return context.state.expertInputs;
};

export const usePromptResult = () => {
  const context = useContext(PromptContext);
  if (context === undefined) throw new Error('usePromptResult must be used within a PromptProvider');
  return {
    result: context.state.result,
    researchData: context.state.researchData,
    variations: context.state.variations,
    isGeneratingVariations: context.state.isGeneratingVariations
  };
};

export const usePromptHistoryInfo = () => {
  const context = useContext(PromptContext);
  if (context === undefined) throw new Error('usePromptHistoryInfo must be used within a PromptProvider');
  return context.history;
}

export const usePromptDispatch = () => {
  const context = useContext(PromptDispatchContext);
  if (context === undefined) throw new Error('usePromptDispatch must be used within a PromptProvider');
  return context;
};

// Legacy Compatibility Hook (Aggregates everything)
export const usePrompt = () => {
  const state = usePromptState();
  const { canUndo, canRedo } = usePromptHistoryInfo();
  const dispatch = usePromptDispatch();

  const setState = useCallback((payload: Partial<PromptState>) => dispatch({ type: 'SET_PARTIAL_STATE', payload }), [dispatch]);
  const setResult = useCallback((payload: { result: GeneratedPrompt | null, researchData: any | null }) => dispatch({ type: 'SET_RESULT', payload }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  return {
    ...state,
    setState,
    setResult,
    reset,
    undo,
    redo,
    canUndo, 
    canRedo 
  };
};
