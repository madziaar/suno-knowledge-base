
import { useCallback } from 'react';
import { usePromptBuilder } from '../../../contexts/PromptContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useUI } from '../../../contexts/UIContext';
import { usePromptGenerator } from './usePromptGenerator';
import { useHistoryActions } from './useHistoryActions';
import { GeneratorState, GeneratedPrompt, BatchConstraints, AudioAnalysisResult } from '../../../types';
import { StyleComponents } from '../utils/styleBuilder';
import { quickEnhance, generateBatchVariations } from '../../../services/ai/tools';
import { analyzeAudioReference, analyzeYouTubeReference } from '../../../services/ai/analysis';
import { GeminiService } from '../../../services/ai/GeminiService';
import { translations } from '../../../translations';
import { sfx } from '../../../lib/audio';

export const useGenerationWorkflow = (viewMode: 'forge' | 'studio') => {
  const { 
    inputs, 
    expertInputs, 
    isExpertMode, 
    lyricSource, 
    useGoogleSearch, 
    result, 
    researchData,
    setResult, 
    setState, 
    updateInput, 
    updateExpertInput,
    setStatus
  } = usePromptBuilder();

  const { lang, isOverclockedMode: isPyriteMode } = useSettings();
  const { setGeneratorState, showToast } = useUI();
  const { saveToHistory } = useHistoryActions();
  
  const { generate: apiGenerate, refine: apiRefine } = usePromptGenerator({ 
    onStateChange: (s) => setGeneratorState(s) 
  });

  const tToast = translations[lang].toast;

  const performAlchemyAnalysis = useCallback(async (base64: string, mimeType: string) => {
      setStatus({ activeAgent: 'researcher', error: '' });
      setGeneratorState(GeneratorState.ANALYZING);
      showToast(translations[lang].builder.audio.analyzing, 'info');
      sfx.play('click');

      try {
          const analysis: AudioAnalysisResult = await analyzeAudioReference(base64, mimeType, isPyriteMode);
          applyAnalysisResult(analysis);
      } catch (e: any) {
          setStatus({ activeAgent: 'idle', error: e.message });
          showToast(tToast.analysisError, 'error');
          sfx.play('error');
      } finally {
          setGeneratorState(GeneratorState.IDLE);
      }
  }, [isPyriteMode, lang, showToast, tToast, setGeneratorState, setStatus]);

  const performYouTubeAnalysis = useCallback(async (url: string) => {
      setStatus({ activeAgent: 'researcher', error: '' });
      setGeneratorState(GeneratorState.ANALYZING);
      showToast(translations[lang].builder.audio.analyzing, 'info');
      sfx.play('click');

      try {
          const analysis: AudioAnalysisResult = await analyzeYouTubeReference(url, isPyriteMode);
          applyAnalysisResult(analysis);
      } catch (e: any) {
          setStatus({ activeAgent: 'idle', error: e.message });
          showToast(tToast.analysisError, 'error');
          sfx.play('error');
      } finally {
          setGeneratorState(GeneratorState.IDLE);
      }
  }, [isPyriteMode, lang, showToast, tToast, setGeneratorState, setStatus]);

  const applyAnalysisResult = (analysis: AudioAnalysisResult) => {
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
    setStatus({ activeAgent: 'researcher', error: '' });
    setResult({ result: null, researchData: null });
    setState({ variations: [], isGeneratingVariations: false });
    
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
            setStatus({ activeAgent: 'idle', error: generationResult.error });
            showToast(generationResult.error, 'error');
        }
    } catch (e: any) {
        const msg = e.message || "An unexpected error occurred.";
        setStatus({ activeAgent: 'idle', error: msg });
        showToast(msg, 'error');
    }
  }, [apiGenerate, inputs, expertInputs, isExpertMode, lyricSource, isPyriteMode, useGoogleSearch, setResult, setState, showToast, tToast, saveToHistory, setStatus]);

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

  const optimizeDraft = useCallback(async () => {
    setGeneratorState(GeneratorState.OPTIMIZING);
    setStatus({ activeAgent: 'optimizer', error: '' });
    showToast(lang === 'pl' ? "Optymalizacja architektury..." : "Optimizing architecture...", 'info');
    sfx.play('click');
    
    try {
        const service = new GeminiService();
        service.initialize(inputs, expertInputs, isPyriteMode, lang);
        const optimized = await service.optimizeDraft({ ...inputs, ...expertInputs });
        
        // Split back to inputs and expertInputs
        const newInputs = { ...inputs };
        const newExpert = { ...expertInputs };
        
        Object.keys(inputs).forEach(key => {
            if ((optimized as any)[key] !== undefined) (newInputs as any)[key] = (optimized as any)[key];
        });
        Object.keys(expertInputs).forEach(key => {
            if ((optimized as any)[key] !== undefined) (newExpert as any)[key] = (optimized as any)[key];
        });

        updateInput(newInputs);
        updateExpertInput(newExpert);
        showToast(lang === 'pl' ? "Architektura zoptymalizowana" : "Architecture Optimized", 'success');
        sfx.play('success');
    } catch (e) {
        showToast("Optimization failed.", 'error');
    } finally {
        setGeneratorState(GeneratorState.IDLE);
        setStatus({ activeAgent: 'idle' });
    }
  }, [inputs, expertInputs, isPyriteMode, lang, updateInput, updateExpertInput, showToast, setGeneratorState, setStatus]);

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

  const updateResultWrapper = useCallback((partial: Partial<GeneratedPrompt>) => {
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
    updateResult: updateResultWrapper,
    generateVariations,
    applyVariation,
    performAlchemyAnalysis,
    performYouTubeAnalysis,
    optimizeDraft,
  };
};
