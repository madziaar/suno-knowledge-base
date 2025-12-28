
import { useCallback, useState } from 'react';
import { usePromptState } from '../../../contexts/PromptContext';
import { usePromptActions } from './usePromptActions';
import { useSettings } from '../../../contexts/SettingsContext';
import { useUI } from '../../../contexts/UIContext';
import { usePromptGenerator } from './usePromptGenerator';
import { useHistoryActions } from './useHistoryActions';
import { GeneratorState, GeneratedPrompt, BatchConstraints, AgentType, AudioAnalysisResult } from '../../../types';
import { StyleComponents } from '../utils/styleBuilder';
import { quickEnhance, generateBatchVariations } from '../../../services/ai/tools';
import { analyzeAudioReference, analyzeYouTubeReference } from '../../../services/ai/analysis';
import { translations } from '../../../translations';
import { sfx } from '../../../lib/audio';

export const useGenerationWorkflow = (viewMode: 'forge' | 'studio') => {
  const { inputs, expertInputs, isExpertMode, lyricSource, useGoogleSearch, result, researchData } = usePromptState();
  const { setResult, setState, updateInput, updateExpertInput } = usePromptActions();
  const { lang, isPyriteMode } = useSettings();
  const { setGeneratorState, showToast } = useUI();
  const { saveToHistory } = useHistoryActions();
  
  const [error, setError] = useState<string>('');
  const [activeAgent, setActiveAgent] = useState<AgentType>('idle');

  const { generate: apiGenerate, refine: apiRefine, state } = usePromptGenerator({ 
    onStateChange: (s) => setGeneratorState(s) 
  });

  const tToast = translations[lang].toast;

  /**
   * THE ALCHEMY TRIGGER
   * Analyzes audio and populates the form with extracted DNA.
   */
  const performAlchemyAnalysis = useCallback(async (base64: string, mimeType: string) => {
      setError('');
      setGeneratorState(GeneratorState.ANALYZING);
      showToast(translations[lang].builder.audio.analyzing, 'info');
      sfx.play('click');

      try {
          const analysis: AudioAnalysisResult = await analyzeAudioReference(base64, mimeType, isPyriteMode);
          applyAnalysisResult(analysis);
      } catch (e: any) {
          setError(e.message);
          showToast(tToast.analysisError, 'error');
          sfx.play('error');
      } finally {
          setGeneratorState(GeneratorState.IDLE);
      }
  }, [isPyriteMode, lang, showToast, tToast, setGeneratorState]);

  /**
   * YOUTUBE SIGNAL INTERCEPTOR
   */
  const performYouTubeAnalysis = useCallback(async (url: string) => {
      setError('');
      setGeneratorState(GeneratorState.ANALYZING);
      showToast(translations[lang].builder.audio.analyzing, 'info');
      sfx.play('click');

      try {
          const analysis: AudioAnalysisResult = await analyzeYouTubeReference(url, isPyriteMode);
          applyAnalysisResult(analysis);
      } catch (e: any) {
          setError(e.message);
          showToast(tToast.analysisError, 'error');
          sfx.play('error');
      } finally {
          setGeneratorState(GeneratorState.IDLE);
      }
  }, [isPyriteMode, lang, showToast, tToast, setGeneratorState]);

  const applyAnalysisResult = (analysis: AudioAnalysisResult) => {
      // Populate the forge with the extracted DNA
      updateInput({
          intent: `${analysis.style}. Error Margin: ${analysis.error_measure || 'Unknown'}. Confidence: ${analysis.confidence_score || 0}%`,
          mood: analysis.mood,
          instruments: analysis.instruments,
      });

      updateExpertInput({
          genre: analysis.genre,
          era: analysis.era,
          bpm: analysis.bpm,
          key: analysis.key
      });

      showToast(`${tToast.analysisComplete} (${analysis.confidence_score || 0}%)`, 'success');
      sfx.play('success');
  };

  const generate = useCallback(async (structuredStyle?: StyleComponents) => {
    setError('');
    setResult({ result: null, researchData: null });
    setState({ variations: [], isGeneratingVariations: false });
    
    setActiveAgent('researcher');
    
    try {
        const generationResult = await apiGenerate(
          inputs,
          expertInputs,
          isExpertMode,
          lyricSource,
          isPyriteMode,
          useGoogleSearch,
          structuredStyle
        );
        
        if (generationResult.success && generationResult.result) {
          const res = generationResult.result;
          const research = generationResult.research;
          
          setResult({ result: res, researchData: research });
          showToast(tToast?.generated || "Sequence Generated", 'success');
          
          saveToHistory(
            res,
            inputs,
            isExpertMode ? expertInputs : undefined,
            isExpertMode,
            lyricSource,
            research || null
          );
        } else if (generationResult.error) {
            setError(generationResult.error);
            showToast(generationResult.error, 'error');
        }
    } catch (e: any) {
        const msg = e.message || "An unexpected error occurred.";
        setError(msg);
        showToast(msg, 'error');
    } finally {
        setActiveAgent('idle');
    }
  }, [apiGenerate, inputs, expertInputs, isExpertMode, lyricSource, isPyriteMode, useGoogleSearch, setResult, setState, showToast, tToast, saveToHistory]);

  const refine = useCallback(async (instruction: string) => {
      showToast("Refining Prompt...", 'info');
      setGeneratorState(GeneratorState.GENERATING); 
      try {
        const { success, result: refinedResult, error: refError } = await apiRefine(
          result, 
          instruction, 
          isPyriteMode
        );
        if (success && refinedResult) {
            setResult({ result: refinedResult, researchData: researchData });
            showToast("Result Refined", 'success');
        } else {
            showToast(refError || "Refinement Failed", 'error');
        }
      } catch (e: any) {
          showToast(e.message || "Refinement failed", 'error');
      } finally {
        setGeneratorState(GeneratorState.COMPLETE);
      }
  }, [apiRefine, result, researchData, isPyriteMode, setResult, showToast, setGeneratorState]);

  const enhance = useCallback(async (field: 'tags' | 'style', inputStr: string) => {
    if (!result) return;
    showToast("Enhancing...", 'info');
    setGeneratorState(GeneratorState.GENERATING);
    try {
        const enhanced = await quickEnhance(inputStr, field);
        setResult({ result: { ...result, [field]: enhanced }, researchData: researchData });
        showToast("Enhancement Complete", 'success');
    } catch (e) {
        showToast("Enhancement Failed", 'error');
    } finally {
      setGeneratorState(GeneratorState.COMPLETE);
    }
  }, [result, researchData, setResult, showToast, setGeneratorState]);

  const updateResult = useCallback((partial: Partial<GeneratedPrompt>) => {
      if (!result) return;
      setResult({ result: { ...result, ...partial }, researchData: researchData });
      showToast("Updated", 'success');
  }, [result, researchData, setResult, showToast]);

  const generateVariations = useCallback(async (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints) => {
    if (!result) return;
    setState({ variations: [], isGeneratingVariations: true });
    showToast("Generating Variations...", 'info');
    try {
        const vars = await generateBatchVariations(result, count, level, isPyriteMode, constraints);
        setState({ variations: vars, isGeneratingVariations: false });
        showToast(`${vars.length} variations ready`, 'success');
    } catch (e: any) {
        showToast("Variation failed.", 'error');
    } finally {
        setState({ isGeneratingVariations: false });
    }
  }, [result, isPyriteMode, setState, showToast]);

  const applyVariation = useCallback((variation: GeneratedPrompt) => {
      setResult({ result: variation, researchData: null });
      setState({ variations: [] }); 
      showToast("Variation Selected", 'success');
  }, [setResult, setState, showToast]);

  return {
    generate,
    refine,
    enhance,
    updateResult,
    generateVariations,
    applyVariation,
    performAlchemyAnalysis, // Export the audio analyzer
    performYouTubeAnalysis, // Export the youtube analyzer
    state,
    error,
    activeAgent,
    researchData
  };
};
