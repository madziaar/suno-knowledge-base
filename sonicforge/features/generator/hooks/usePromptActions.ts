
import { useCallback } from 'react';
import { usePromptDispatch, PromptState } from '../../../contexts/PromptContext';
import { SongConcept, ExpertInputs, GeneratedPrompt, Platform } from '../../../types';

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
