
import { useCallback } from 'react';
import { usePromptState } from '../../../contexts/PromptContext';
import { usePromptActions } from './usePromptActions';
import { useSettings } from '../../../contexts/SettingsContext';
import { useUI } from '../../../contexts/UIContext';
import { usePromptGenerator } from './usePromptGenerator';
import { useHistoryActions } from './useHistoryActions';
import { GeneratorState, GeneratedPrompt, BatchConstraints } from '../../../types';
import { StyleComponents } from '../utils/styleBuilder';
import { quickEnhance, generateBatchVariations } from '../../../services/ai/tools';
import { translations } from '../../../translations';
import { enhancePrompt, analyzePrompt } from '../utils/promptEnhancer';
import { STRUCTURE_TEMPLATES } from '../data/genreDatabase';
import { generateStructureSkeleton } from '../utils/lyricsFormatter';

export const useGenerationWorkflow = (viewMode: 'forge' | 'studio') => {
  const { inputs, expertInputs, isExpertMode, lyricSource, useGoogleSearch, result, researchData, enhancementLevel } = usePromptState();
  const { setResult, setState } = usePromptActions();
  const { lang, isPyriteMode } = useSettings();
  const { setGeneratorState, showToast } = useUI();
  const { saveToHistory } = useHistoryActions();
  
  const { state, error, activeAgent, generate: apiGenerate, refine: apiRefine } = usePromptGenerator({ onStateChange: setGeneratorState });

  const tToast = translations[lang].toast;

  const generate = useCallback(async (structuredStyle?: StyleComponents) => {
    setResult({ result: null, researchData: null });
    setState({ variations: [], isGeneratingVariations: false });

    // Determine if we should force expert mode logic based on the active view
    const useExpertLogic = viewMode === 'studio' || isExpertMode;

    // --- AUTOMATED STUDIO MAGIC (Protocol V58) ---
    // If we are in Easy or General mode, we perform "Studio" operations in the background
    // 1. Auto-Enhance the Intent
    // 2. Auto-Detect and Inject Structure
    
    let effectiveInputs = { ...inputs };
    let effectiveStructure = undefined;

    if (!useExpertLogic && (inputs.mode === 'easy' || inputs.mode === 'general')) {
       // 1. Auto-Enhance
       const enhancedIntent = enhancePrompt(inputs.intent, enhancementLevel || 'medium');
       effectiveInputs.intent = enhancedIntent;

       // 2. Auto-Structure Detection
       // We analyze the enhanced intent to guess the best structure
       const analysis = analyzePrompt(enhancedIntent);
       let targetTemplate = STRUCTURE_TEMPLATES.pop; // Default

       if (analysis.genreContext === 'hiphop') targetTemplate = STRUCTURE_TEMPLATES.hiphop;
       else if (analysis.genreContext === 'electronic') targetTemplate = STRUCTURE_TEMPLATES.electronic;
       else if (analysis.genreContext === 'rock' || analysis.genreContext === 'metal') targetTemplate = STRUCTURE_TEMPLATES.punk; // Good energy structure
       else if (analysis.genreContext === 'orchestral') targetTemplate = STRUCTURE_TEMPLATES.cinematic;
       
       // Format the template into a string string
       effectiveStructure = targetTemplate.structure.map(s => `[${s}]`).join('\n');
       
       // UI Feedback for Magic
       if (inputs.mode === 'easy') {
           showToast(`Auto-Enhancing: ${analysis.genreContext.toUpperCase()} Protocol`, 'info');
       }
    }

    const { success, result: genResult, research } = await apiGenerate(
      effectiveInputs,
      expertInputs,
      useExpertLogic,
      lyricSource,
      isPyriteMode,
      useGoogleSearch,
      structuredStyle,
      effectiveStructure // Pass the auto-detected structure
    );
    
    if (success && genResult) {
      setResult({ result: genResult, researchData: research });
      showToast(tToast?.generated || "Generated", 'success');
      
      saveToHistory(
        genResult,
        effectiveInputs, // Save the ENHANCED inputs so user sees what happened
        useExpertLogic ? expertInputs : undefined,
        useExpertLogic,
        lyricSource,
        research || null
      );
    }
  }, [apiGenerate, inputs, expertInputs, viewMode, isExpertMode, lyricSource, isPyriteMode, useGoogleSearch, setResult, setState, showToast, tToast, saveToHistory, enhancementLevel]);

  const refine = useCallback(async (instruction: string) => {
      showToast("Refining...", 'info');
      setGeneratorState(GeneratorState.ANALYZING); 
      try {
        const { success, result: refinedResult } = await apiRefine(
          result, 
          instruction, 
          isPyriteMode, 
          inputs.platform,
          inputs.lyricsLanguage
        );
        if (success && refinedResult) {
            setResult({ result: refinedResult, researchData });
            showToast("Update Complete", 'success');
        } else {
            showToast("Refinement Failed", 'info');
        }
      } finally {
        setGeneratorState(GeneratorState.COMPLETE);
      }
  }, [apiRefine, result, inputs.platform, inputs.lyricsLanguage, isPyriteMode, researchData, setResult, showToast, setGeneratorState]);

  const enhance = useCallback(async (field: 'tags' | 'style', inputStr: string) => {
    if (!result) return;
    showToast("Enhancing...", 'info');
    setGeneratorState(GeneratorState.ANALYZING);
    try {
        const enhanced = await quickEnhance(inputStr, field);
        setResult({ result: { ...result, [field]: enhanced }, researchData });
        showToast("Enhanced!", 'success');
    } catch (e) {
        showToast("Failed", 'info');
    } finally {
      setGeneratorState(GeneratorState.COMPLETE);
    }
  }, [result, researchData, setResult, showToast, setGeneratorState]);

  const updateResult = useCallback((partial: Partial<GeneratedPrompt>) => {
      if (!result) return;
      setResult({ result: { ...result, ...partial }, researchData });
      showToast("Result Updated", 'success');
  }, [result, researchData, setResult, showToast]);

  const generateVariations = useCallback(async (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints) => {
    if (!result) return;
    setState({ variations: [], isGeneratingVariations: true });
    showToast("Generating variations...", 'info');
    try {
        const vars = await generateBatchVariations(result, count, level, isPyriteMode, constraints);
        setState({ variations: vars, isGeneratingVariations: false });
        showToast(`${vars.length} variations generated!`, 'success');
    } catch (e: any) {
        showToast(e.message || "Failed to generate variations.", 'error');
    } finally {
        setState({ isGeneratingVariations: false });
    }
  }, [result, isPyriteMode, setState, showToast]);

  const applyVariation = useCallback((variation: GeneratedPrompt) => {
      setResult({ result: variation, researchData });
      setState({ variations: [] }); 
      showToast("Variation applied!", 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result, researchData, setResult, setState, showToast]);

  return {
    generate,
    refine,
    enhance,
    updateResult,
    generateVariations,
    applyVariation,
    state,
    error,
    activeAgent,
    researchData
  };
};
