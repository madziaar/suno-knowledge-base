
import React, { useCallback, useState } from 'react';
import { Wand2, Sparkles, MoveRight, Cpu, Dices, Plus, Mic2, Search, Layers, Music2, Radio, Languages, Zap } from 'lucide-react';
import { BuilderTranslation, GeneratorState, ToastTranslation, UserPreset } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Switch } from '../../../components/ui/Switch';
import AudioUploader from './AudioUploader';
import SmartLyricEditor from './SmartLyricEditor';
import { analyzeAudioReference } from '../../../services/ai/analysis';
import { sfx } from '../../../lib/audio';
import { compressState } from '../../../lib/sharing';
import { presetTemplates } from '../data/presets';
import PromptImporter from './ConfigForm/PromptImporter';
import { cn } from '../../../lib/utils';
import { StyleComponents } from '../utils/styleBuilder';
import Tooltip from '../../../components/Tooltip';
import VocalStyleDesigner from './inputs/VocalStyleDesigner';
import GenrePicker from './inputs/GenrePicker';
import { usePromptState } from '../../../contexts/PromptContext';
import { usePromptActions } from '../hooks/usePromptActions';
import { generateStructure } from '../utils/lyricsFormatter';
import { LYRIC_LANGUAGES } from '../data/autocompleteData';
import ConceptInput from './inputs/ConceptInput'; // Kept for Cover Mode re-use

// Sub Forms
import ControlBar from './forms/ControlBar';
import ConceptForm from './forms/ConceptForm';
import VibeForm from './forms/VibeForm';

interface ConfigFormProps {
  state: GeneratorState;
  onGenerate: (structuredStyle?: StyleComponents) => void;
  onClear: () => void;
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode: boolean;
  lang: 'en' | 'pl';
  onPresetLoad: (name: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  richLyricContext: string;
  onRandomize?: () => void;
}

type AudioSubMode = 'vocals' | 'instrumental' | 'inspire' | 'cover';

const EASY_VIBES = ['Epic', 'Chill', 'Dark', 'Happy', 'Aggressive', 'Romantic', 'Weird', 'Party'];

const ConfigForm: React.FC<ConfigFormProps> = ({
  state, onGenerate, onClear,
  t, toast, isPyriteMode, lang, onPresetLoad, showToast,
  richLyricContext,
  onRandomize
}) => {
  // Connect to Context
  const { inputs, expertInputs, lyricSource, useReMi } = usePromptState();
  const { updateInput, updateExpertInput, setState, setPlatform, setMode, setWorkflow } = usePromptActions();

  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  
  // Local state for Easy Mode UI
  const [easyModeVibe, setEasyModeVibe] = useState<string>('');
  const [easyModeType, setEasyModeType] = useState<'vocal' | 'instrumental'>('vocal');
  
  // Local state derived from global context inputs for easier access
  const platform = inputs.platform;
  const workflow = inputs.workflow || 'forge';
  const audioSubMode = inputs.alchemyMode || 'inspire';

  // --- HANDLERS ---
  
  const handleSetLyrics = useCallback((val: string) => updateInput({ lyricsInput: val }), [updateInput]);
  const handleSetReMi = useCallback((val: boolean) => setState({ useReMi: val }), [setState]);
  const handleSetLyricLanguage = useCallback((val: string) => updateInput({ lyricsLanguage: val }), [updateInput]);
  
  // Effect to handle Instrumental Mode side effects
  React.useEffect(() => {
      if (inputs.mode === 'instrumental' && (!expertInputs.structure || expertInputs.structure.length === 0)) {
          // Detect genre from expert inputs or default to 'pop'
          const currentGenre = expertInputs.genre || 'pop';
          const instrumentalTemplate = generateStructure(currentGenre, 180, true);
          const newStructure = instrumentalTemplate.structure.map(s => ({
              id: crypto.randomUUID(),
              type: s,
              modifiers: []
          }));
          updateExpertInput({ structure: newStructure });
      }
  }, [inputs.mode, expertInputs.genre, updateExpertInput]);


  const handleAudioUpload = useCallback(async (base64: string, mimeType: string) => {
    setIsAnalyzingAudio(true);
    showToast(t.audio?.analyzing || "Analyzing...", 'info');
    sfx.play('hover');
    try {
        const analysis = await analyzeAudioReference(base64, mimeType, isPyriteMode);
        
        updateInput({
            intent: analysis.style,
            mood: analysis.mood,
            instruments: analysis.instruments,
            artistReference: `Audio Ref: ${analysis.genre} (${analysis.era})`
        });
        
        updateExpertInput({
            bpm: analysis.bpm,
            key: analysis.key,
            genre: analysis.genre,
            era: analysis.era
        });
        
        showToast(toast.analysisComplete || "Analysis Complete", 'success');
        sfx.play('success');
    } catch (e) {
        showToast(toast.analysisError || "Analysis Failed", 'error');
        sfx.play('error');
    } finally {
        setIsAnalyzingAudio(false);
    }
  }, [t, toast, isPyriteMode, updateInput, updateExpertInput, showToast]);

  const handleShare = useCallback(async () => {
    showToast("Generating Neural Link...", 'info');
    try {
        const encoded = await compressState(inputs, expertInputs, false, isPyriteMode); // Using false for isExpertMode in simple share
        const url = `${window.location.origin}${window.location.pathname}?forge=${encoded}`;
        await navigator.clipboard.writeText(url);
        showToast(toast.linkCreated || "Link Copied", 'success');
        sfx.play('success');
    } catch (e) {
        showToast("Link Gen Failed", 'error');
    }
  }, [inputs, expertInputs, isPyriteMode, showToast, toast]);

  const handlePresetChange = useCallback((presetId: string) => {
    if (!presetId) return;
    const preset = presetTemplates.find(p => p.id === presetId);
    if (preset) {
        const newMode = preset.suggestedMode || 'custom';
        
        if (preset.platform && preset.platform !== platform) {
            setPlatform(preset.platform);
        }

        updateInput({
            intent: preset.style,
            mood: preset.mood,
            instruments: preset.instruments,
            mode: newMode,
            platform: 'suno',
            lyricsInput: preset.lyrics || inputs.lyricsInput
        });
        
        setState({ lyricSource: 'ai' });
        if (onPresetLoad) onPresetLoad(lang === 'pl' ? preset.name.pl : preset.name.en);
    }
  }, [platform, setPlatform, updateInput, inputs, setState, onPresetLoad, lang]);

  const handleUserPresetLoad = useCallback((preset: UserPreset) => {
      updateInput(preset.inputs);
      updateExpertInput(preset.expertInputs);
      setState({ isExpertMode: preset.isExpertMode });
      setPlatform('suno');
      
      if (onPresetLoad) onPresetLoad(preset.name);
      showToast(toast.presetLoaded + " " + preset.name, 'success');
  }, [updateInput, updateExpertInput, setState, setPlatform, onPresetLoad, showToast, toast.presetLoaded]);

  const handleGenerateClick = useCallback(() => {
      let intent = inputs.intent;
      
      if (inputs.mode === 'easy') {
          if (easyModeVibe) intent += `, Vibe: ${easyModeVibe}`;
          if (easyModeType === 'instrumental') {
              intent += ", Instrumental Track";
          } else {
              intent += ", Vocal Track with Lyrics";
          }
      }

      const structuredStyle: StyleComponents = {
          genres: expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : [],
          subGenres: [],
          moods: inputs.mood ? inputs.mood.split(',').map(s=>s.trim()) : [],
          vocals: [],
          vocalStyle: expertInputs.vocalStyle,
          bpm: expertInputs.bpm,
          key: expertInputs.key,
          era: expertInputs.era,
          instruments: (expertInputs.instrumentStyle || inputs.instruments || '').split(',').map(s=>s.trim()).filter(Boolean),
          atmosphere: (expertInputs.atmosphereStyle || '').split(',').map(s=>s.trim()).filter(Boolean),
          production: (expertInputs.techAnchor || '').split(',').map(s=>s.trim()).filter(Boolean),
          influences: inputs.artistReference ? [inputs.artistReference] : []
      };
      
      if (inputs.mode === 'easy') {
          updateInput({ intent: intent }); 
      }
      
      onGenerate(structuredStyle);
  }, [inputs, expertInputs, onGenerate, easyModeVibe, easyModeType, updateInput]);

  const handleImportApply = useCallback((newInputs: Partial<any>, newExpert: Partial<any>) => {
      updateInput(newInputs);
      updateExpertInput(newExpert);
      showToast("Prompt Imported Successfully", 'success');
      sfx.play('success');
  }, [updateInput, updateExpertInput, showToast]);

  const handleOneShotRandomize = useCallback(() => {
      if (onRandomize) {
          onRandomize();
          const randomVibe = EASY_VIBES[Math.floor(Math.random() * EASY_VIBES.length)];
          setEasyModeVibe(randomVibe);
          sfx.play('success');
      }
  }, [onRandomize]);

  const isGenerating = state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING;

  // Language options
  const languageOptions = [
      { label: 'Auto-Detect', value: 'auto' },
      ...LYRIC_LANGUAGES.map(l => ({ label: l, value: l }))
  ];

  const alchemyOptions = [
    { id: 'inspire', icon: Search, label: t.alchemy.inspire.label, desc: t.alchemy.inspire.desc },
    { id: 'vocals', icon: Mic2, label: t.alchemy.addVocals.label, desc: t.alchemy.addVocals.desc },
    { id: 'instrumental', icon: Music2, label: t.alchemy.addInstrumentals.label, desc: t.alchemy.addInstrumentals.desc },
    { id: 'cover', icon: Layers, label: t.alchemy.cover.label, desc: t.alchemy.cover.desc },
  ];

  return (
    <div className="relative flex flex-col h-full">
      {showImporter && (
          <PromptImporter 
            onApply={handleImportApply} 
            onClose={() => setShowImporter(false)}
            isPyriteMode={isPyriteMode}
          />
      )}

      {/* Content Area */}
      <div className="flex-1 space-y-6 pb-32">
        
        {/* Header - Suno Badge & Reset */}
        <div className="flex flex-wrap items-stretch justify-between gap-3">
            <div className={cn(
                "flex-[2] px-4 py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/60 border flex items-center justify-center gap-2 cursor-help backdrop-blur-sm min-w-[200px]",
                isPyriteMode
                    ? "text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    : "text-blue-500 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            )} title="Optimized for Suno v4.5 features: 8-min songs, microtonal vocals, genre fusion">
                <span className={cn("w-2 h-2 rounded-full animate-pulse", isPyriteMode ? "bg-purple-500" : "bg-blue-500")} />
                <Cpu className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Suno Unified v4.5+</span>
                <span className="md:hidden">Suno v4.5+</span>
            </div>

            <Button
                variant={isPyriteMode ? 'danger' : 'outline'}
                onClick={onClear}
                className="flex-1 min-w-[100px]"
                icon={<Plus className={cn("w-4 h-4", isPyriteMode ? "animate-pulse" : "")} />}
            >
                <span className="whitespace-nowrap">{isPyriteMode ? "INITIATE NEW" : "NEW SONG"}</span>
            </Button>
        </div>

        <div className="space-y-4">
            {/* Workflow Toggles */}
            <Card variant={isPyriteMode ? 'pyrite' : 'default'} noPadding className="p-1 flex space-x-1">
                <Button
                    variant={workflow === 'forge' ? 'primary' : 'ghost'}
                    isPyrite={isPyriteMode}
                    onClick={() => setWorkflow('forge')}
                    className="flex-1 text-xs py-3"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                    The Forge
                </Button>
                <Button
                    variant={workflow === 'alchemy' ? 'primary' : 'ghost'}
                    isPyrite={isPyriteMode}
                    onClick={() => setWorkflow('alchemy')}
                    className="flex-1 text-xs py-3"
                    icon={<Layers className="w-3.5 h-3.5" />}
                >
                    Alchemy
                </Button>
            </Card>

            {workflow === 'alchemy' ? (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                    {/* Audio-to-Audio Feature Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {alchemyOptions.map(opt => {
                            const isActive = audioSubMode === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => updateInput({ alchemyMode: opt.id as any })}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 relative overflow-hidden group",
                                        isActive
                                            ? (isPyriteMode 
                                                ? "bg-pink-900/30 border-pink-500/50 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.2)]" 
                                                : "bg-zinc-800 border-white/20 text-white")
                                            : "bg-zinc-900/40 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-full transition-transform group-hover:scale-110",
                                        isActive 
                                            ? (isPyriteMode ? "bg-pink-500 text-white" : "bg-yellow-500 text-black")
                                            : "bg-black/30 text-zinc-400"
                                    )}>
                                        <opt.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-bold uppercase tracking-tight">{opt.label}</span>
                                        <span className="block text-[9px] opacity-60 font-mono mt-0.5">{opt.desc}</span>
                                    </div>
                                    {isActive && <div className={cn("absolute inset-0 opacity-10 pointer-events-none animate-pulse", isPyriteMode ? "bg-pink-500" : "bg-yellow-500")} />}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Alchemy Sub-Modes */}
                    {audioSubMode !== 'inspire' && (
                        <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-5">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Mic2 className="w-3.5 h-3.5" />
                                Input Source ({t.alchemy[audioSubMode as keyof typeof t.alchemy]?.label || audioSubMode})
                            </h4>
                            <AudioUploader 
                                onAudioSelected={handleAudioUpload}
                                onClear={() => {}}
                                isAnalyzing={isAnalyzingAudio}
                                t={t}
                                isPyriteMode={isPyriteMode}
                            />
                        </Card>
                    )}

                    {/* SUB-MODES UI */}
                    {audioSubMode === 'vocals' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Vocal Style</label>
                                <VocalStyleDesigner 
                                    value={expertInputs.vocalStyle || ''}
                                    onChange={(val) => updateExpertInput({ vocalStyle: val })}
                                    genre={expertInputs.genre}
                                    isPyriteMode={isPyriteMode}
                                    t={t}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Lyrics</label>
                                <SmartLyricEditor 
                                    value={inputs.lyricsInput}
                                    onChange={handleSetLyrics}
                                    placeholder="Enter lyrics for the AI to sing over your instrumental..."
                                    isPyriteMode={isPyriteMode}
                                    context={richLyricContext}
                                    genre={expertInputs.genre}
                                    lang={lang}
                                    className="h-64"
                                />
                            </div>
                        </div>
                    )}

                    {/* INSTRUMENTAL MODE */}
                    {audioSubMode === 'instrumental' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <GenrePicker 
                                value={expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : []}
                                onChange={genres => updateExpertInput({ genre: genres.join(', ') })}
                                isPyriteMode={isPyriteMode}
                                t={t}
                            />
                            <VibeForm t={t} isPyriteMode={isPyriteMode} />
                        </div>
                    )}

                    {/* COVER MODE */}
                    {audioSubMode === 'cover' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <GenrePicker 
                                value={expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : []}
                                onChange={genres => updateExpertInput({ genre: genres.join(', ') })}
                                isPyriteMode={isPyriteMode}
                                t={t}
                            />
                            <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-white/5 shadow-inner">
                                <ConceptInput t={t} isPyriteMode={isPyriteMode} />
                            </div>
                        </div>
                    )}
                    
                    {/* INSPIRE MODE */}
                    {audioSubMode === 'inspire' && (
                        <div className={cn(
                            "p-8 rounded-xl border border-dashed text-center space-y-6 animate-in fade-in zoom-in-95",
                            isPyriteMode ? "border-pink-500/30 bg-pink-900/5" : "border-white/20 bg-black/20"
                        )}>
                            <div className={cn(
                                "mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-2xl",
                                isPyriteMode ? "bg-pink-600/20 text-pink-400" : "bg-zinc-800 text-zinc-400"
                            )}>
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <p className={cn("text-lg font-bold", isPyriteMode ? "text-pink-100" : "text-zinc-300")}>Paste a Playlist URL</p>
                                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                                    The AI will extract the sonic DNA of your playlist (Spotify, YouTube, Apple Music) and forge a new creation in that image.
                                </p>
                            </div>
                            <div className="relative max-w-md mx-auto">
                                <Input
                                    value={inputs.playlistUrl || ''}
                                    onChange={(e) => updateInput({ playlistUrl: e.target.value })}
                                    isPyrite={isPyriteMode}
                                    placeholder="https://open.spotify.com/playlist/..."
                                    rightElement={<MoveRight className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* FORGE WORKFLOW (Standard) */}
                    
                    <ControlBar 
                        onPresetLoad={onPresetLoad}
                        onClear={onClear}
                        onRandomize={onRandomize || (() => {})}
                        onShare={handleShare}
                        onUserPresetLoad={handleUserPresetLoad}
                        onPresetChange={handlePresetChange}
                        t={t}
                        isPyriteMode={isPyriteMode}
                        lang={lang}
                        showToast={showToast}
                    />

                    {/* --- EASY ONE-SHOT MODE (ENHANCED) --- */}
                    {inputs.mode === 'easy' && (
                        <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-6 flex flex-col space-y-5 animate-in fade-in slide-in-from-top-4">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-1">
                                <div className={cn(
                                    "p-2.5 rounded-xl",
                                    isPyriteMode ? "bg-purple-600/20 text-purple-300" : "bg-yellow-500/20 text-yellow-400"
                                )}>
                                    <Wand2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight">One-Shot Forge</h3>
                                    <p className="text-[10px] text-zinc-400">Instant generation with auto-lyrics & structure.</p>
                                </div>
                            </div>
                            
                            {/* Controls Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Track Type */}
                                <div className="bg-black/30 p-2 rounded-xl flex gap-1">
                                    <button 
                                        onClick={() => { setEasyModeType('vocal'); setState({ lyricSource: 'ai' }); }}
                                        data-state={easyModeType === 'vocal' ? 'active' : 'inactive'}
                                        className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1", 
                                            "text-zinc-500 hover:text-zinc-300 data-[state=active]:text-white",
                                            isPyriteMode 
                                                ? "data-[state=active]:bg-purple-600" 
                                                : "data-[state=active]:bg-zinc-700"
                                        )}
                                    >
                                        <Mic2 className="w-4 h-4" />
                                        Vocal Song
                                    </button>
                                    <button 
                                        onClick={() => { setEasyModeType('instrumental'); setState({ lyricSource: 'ai' }); }}
                                        data-state={easyModeType === 'instrumental' ? 'active' : 'inactive'}
                                        className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1", 
                                            "text-zinc-500 hover:text-zinc-300 data-[state=active]:text-white",
                                            isPyriteMode 
                                                ? "data-[state=active]:bg-pink-600" 
                                                : "data-[state=active]:bg-zinc-700"
                                        )}
                                    >
                                        <Radio className="w-4 h-4" />
                                        Instrumental
                                    </button>
                                </div>

                                {/* Language */}
                                <div className={cn(
                                    "bg-black/30 p-2 rounded-xl border flex items-center px-3",
                                    isPyriteMode ? "border-purple-500/20" : "border-white/5"
                                )}>
                                    <Select
                                        value={inputs.lyricsLanguage || 'auto'}
                                        onChange={handleSetLyricLanguage}
                                        options={languageOptions}
                                        placeholder="Auto Language"
                                        label={t.lyricsLangLabel || "Language"}
                                        isPyrite={isPyriteMode}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Vibe Selector */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Select Vibe (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {EASY_VIBES.map(vibe => (
                                        <button
                                            key={vibe}
                                            onClick={() => setEasyModeVibe(easyModeVibe === vibe ? '' : vibe)}
                                            data-state={easyModeVibe === vibe ? 'active' : 'inactive'}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                                "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700",
                                                isPyriteMode 
                                                    ? "data-[state=active]:bg-purple-500/20 data-[state=active]:border-purple-500 data-[state=active]:text-purple-300"
                                                    : "data-[state=active]:bg-yellow-500/20 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500"
                                            )}
                                        >
                                            {vibe}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Input */}
                            <Textarea
                                value={inputs.intent}
                                onChange={(e) => updateInput({ intent: e.target.value })}
                                placeholder="Describe your song idea..."
                                className="h-24"
                                isPyrite={isPyriteMode}
                            />

                            {/* Actions */}
                            <Button 
                                onClick={handleOneShotRandomize}
                                variant="secondary"
                                className="w-full text-xs"
                                icon={<Dices className="w-3.5 h-3.5" />}
                            >
                                Surprise Me (Random Concept)
                            </Button>
                        </Card>
                    )}

                    {/* --- STANDARD MODES --- */}
                    {inputs.mode !== 'easy' && (
                        <>
                            {lyricSource === 'user' && (inputs.mode === 'custom' || inputs.mode === 'instrumental') && (
                                <div className="animate-in fade-in slide-in-from-top-4">
                                    <SmartLyricEditor 
                                        value={inputs.lyricsInput}
                                        onChange={handleSetLyrics}
                                        placeholder={inputs.mode === 'instrumental' ? "[Intro]\n[Melodic Bass]\n[Drop]\n..." : t.pastePlaceholder}
                                        isPyriteMode={isPyriteMode}
                                        context={richLyricContext}
                                        genre={expertInputs.genre}
                                        lang={lang}
                                    />
                                </div>
                            )}
                            
                            {inputs.platform === 'suno' && inputs.mode === 'custom' && lyricSource === 'ai' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl border bg-zinc-900/30 animate-in fade-in flex items-center",
                                    isPyriteMode ? "border-purple-500/20" : "border-zinc-800"
                                )}>
                                    <Switch 
                                        checked={useReMi} 
                                        onChange={handleSetReMi} 
                                        isPyrite={isPyriteMode}
                                        label={
                                            <div className="flex items-center">
                                                <Sparkles className={cn("w-3.5 h-3.5 mr-1.5", useReMi ? (isPyriteMode ? "text-purple-400" : "text-yellow-400") : "text-zinc-600")} />
                                                <span className={cn("font-bold tracking-wide transition-colors", useReMi ? "text-white" : "text-zinc-400")}>{t.aiLyricOptions.remi}</span>
                                                <div className="ml-2">
                                                    <Tooltip content={t.aiLyricOptions.remiTooltip} />
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>

                                {/* Language Selector */}
                                <div className={cn(
                                    "p-1.5 rounded-xl border bg-zinc-900/30 animate-in fade-in",
                                    isPyriteMode ? "border-purple-500/20" : "border-zinc-800"
                                )}>
                                    <Select 
                                        value={inputs.lyricsLanguage || 'auto'}
                                        onChange={handleSetLyricLanguage}
                                        options={languageOptions}
                                        placeholder="Auto-Detect Language"
                                        label={t.lyricsLangLabel || "Language"}
                                        isPyrite={isPyriteMode}
                                        icon={<Languages className="w-3 h-3" />}
                                    />
                                </div>
                            </div>
                            )}

                            <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-5 space-y-6">
                                <ConceptForm t={t} isPyriteMode={isPyriteMode} />
                                <div className="h-px bg-white/5" />
                                <VibeForm t={t} isPyriteMode={isPyriteMode} />
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className={cn(
          "sticky bottom-0 z-20 pb-4 pt-12 -mx-4 px-4 bg-gradient-to-t pointer-events-none",
          isPyriteMode ? 'from-[#050505] via-[#050505] to-transparent' : 'from-zinc-950 via-zinc-950 to-transparent'
      )}>
        <div className="pointer-events-auto">
            <Button 
                onClick={handleGenerateClick}
                isLoading={isGenerating}
                variant="primary"
                isPyrite={isPyriteMode}
                className={cn(
                    "w-full py-4 text-base shadow-xl transform transition-transform hover:scale-[1.02] active:scale-[0.98]",
                    workflow === 'alchemy' && isPyriteMode && "shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] border-pink-500 bg-gradient-to-r from-purple-600 to-pink-600"
                )}
                icon={isGenerating ? null : (workflow === 'alchemy' ? <Sparkles className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />)}
            >
                {isGenerating 
                ? (state === GeneratorState.RESEARCHING ? t.buttons?.scanning : t.buttons?.thinking) 
                : (workflow === 'alchemy' 
                    ? `TRANSMUTE (${t.alchemy[audioSubMode as keyof typeof t.alchemy]?.label || audioSubMode.toUpperCase()})` 
                    : (inputs.mode === 'instrumental' ? t.buttons?.forge + " (INST)" : (inputs.mode === 'easy' ? "FORGE IT!" : t.buttons?.forge))
                )
                }
            </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfigForm);
