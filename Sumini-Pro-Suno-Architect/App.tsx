import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { Analytics } from "@vercel/analytics/react";
import { Message, GeneratorMode, ParsedSong, LyricsLanguage, StudioSettings } from './types';
import { generateContentResponse, enhanceStyle } from './services/geminiService';
import { MessageList } from './components/MessageList';
import { HelpButton, HelpPopup, HelpSectionKey } from './components/HelpUI';
import { useUiSound } from './hooks/useUiSound';
import { useSettings } from './context/SettingsContext';
import { SettingsPanel } from './components/SettingsPanel';
import {
  Sparkles,
  Zap,
  Mic2,
  SlidersHorizontal,
  Send,
  Trash2,
  ExternalLink,
  Wand2,
  Settings2,
  ChevronUp,
  LayoutTemplate,
  Flame,
  Dice5,
  Music2,
  Users,
  Menu,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';

/* ----------------------- Custom UI Components ----------------------- */

const TogglePill: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => {
  const { playClick } = useUiSound();
  return (
    <button 
      onClick={() => { playClick(); onClick(); }}
      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border transform active:scale-95 ${active ? 'bg-zinc-100 border-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 hover:border-white/20'}`}
    >
      {label}
    </button>
  );
};

const ModeButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; colorClass?: string }> = ({ icon, label, onClick, colorClass = "text-zinc-400 group-hover:text-zinc-100" }) => {
  const { playClick } = useUiSound();
  return (
    <button 
      onClick={() => { playClick(); onClick(); }}
      className="group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20"
    >
      <div className={`transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 ${colorClass}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight transition-colors text-zinc-500 group-hover:text-zinc-200">{label}</span>
    </button>
  );
};

const Knob: React.FC<{ value: number; onChange: (v: number) => void; label: string; leftLabel: string; rightLabel: string }> = ({ value, onChange, label, leftLabel, rightLabel }) => {
  const { playTick } = useUiSound();
  const lastVal = useRef(value);

  const handleChange = (newVal: number) => {
    if (Math.abs(newVal - lastVal.current) >= 5) {
      playTick();
      lastVal.current = newVal;
    }
    onChange(newVal);
  };

  return (
    <div className="space-y-2 group select-none">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">{label}</span>
        <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded-md min-w-[36px] text-center border border-white/5">{value}%</span>
      </div>
      <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
         <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-500 to-indigo-400 opacity-80 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${value}%` }} />
         <input 
          type="range" 
          min="0" max="100" 
          value={value} 
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[9px] text-zinc-600 font-mono uppercase tracking-tight">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

const GlassSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative group">
    <select 
      {...props} 
      className="w-full appearance-none bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all backdrop-blur-md cursor-pointer shadow-sm"
    />
    <ChevronUp size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-hover:text-zinc-400 transition-colors rotate-180" />
  </div>
);

const App: React.FC = () => {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sumini_chat_history');
      if (saved) {
        try { return JSON.parse(saved) as Message[]; } catch (e) {}
      }
    }
    return [{ id: 'init', role: 'model', content: "Studio initialized. Ready for production." }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  
  // Context & Hooks
  const { settings: appSettings } = useSettings();
  const { playClick, playWoosh, playSuccess, playTick } = useUiSound();

  // Help System State
  const [activeHelp, setActiveHelp] = useState<HelpSectionKey | null>(null);
  const helpTriggerRefs = {
    mood: useRef<HTMLButtonElement>(null),
    vocal: useRef<HTMLButtonElement>(null),
    structure: useRef<HTMLButtonElement>(null),
  };

  // Settings
  const [isRadioEdit, setIsRadioEdit] = useState(false);
  const [hasIntro, setHasIntro] = useState(false);
  const [lyricsLanguage, setLyricsLanguage] = useState<LyricsLanguage>(LyricsLanguage.ENGLISH);
  const [moodDarkBright, setMoodDarkBright] = useState(50);
  const [moodCleanGritty, setMoodCleanGritty] = useState(50);
  const [moodEnergy, setMoodEnergy] = useState(50);
  const [vocalGender, setVocalGender] = useState<StudioSettings['vocal']['gender']>('Any');
  const [vocalTexture, setVocalTexture] = useState<StudioSettings['vocal']['texture']>('Any');
  const [structure, setStructure] = useState<StudioSettings['structure']>('Auto');

  // Refs
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('sumini_chat_history', JSON.stringify(messages));
    historyRef.current = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
  }, [messages]);

  // --- HANDLERS ---
  const handleClear = () => {
    playClick();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsGenerating(false);
    setErrorToast(null);

    const resetMessage: Message = { 
      id: 'welcome', 
      role: 'model', 
      content: 'Session cleared. Ready for a new track.' 
    };

    setMessages([resetMessage]);
    historyRef.current = [{ role: 'model', parts: [{ text: resetMessage.content }] }];
    localStorage.removeItem('sumini_chat_history');
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;
    
    playClick();
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceStyle(input);
      if (enhanced) setInput(enhanced);
    } catch (e: any) {
      console.error(e);
      // Helpful error message for missing keys during enhance
      const isKeyError = e.message?.includes('API key') || e.message?.includes('403') || e.toString().includes('API_KEY');
      setErrorToast(isKeyError ? "Missing API Key. Check Env Vars." : "Enhancement failed. Try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSend = useCallback(async (text: string, mode: GeneratorMode = GeneratorMode.NORMAL) => {
      // 1. Secret Developer Mode Trigger
      if (mode === GeneratorMode.NORMAL && text.trim().toLowerCase() === 'dain') {
        setIsDevMode(true);
        setIsSettingsOpen(true);
        setInput('');
        playSuccess();
        setErrorToast("Developer Mode Activated 🛠️");
        setTimeout(() => setErrorToast(null), 3000);
        return;
      }

      if (!text.trim() && mode === GeneratorMode.NORMAL) return;

      playSuccess();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const studioSettings: StudioSettings = {
        mood: { darkBright: moodDarkBright, cleanGritty: moodCleanGritty, energy: moodEnergy },
        vocal: { gender: vocalGender, texture: vocalTexture },
        structure: structure
      };

      let displayContent = text;
      if (mode === GeneratorMode.RANDOM) displayContent = "🎲 Generating Random Hit...";
      else if (mode === GeneratorMode.TRENDING) displayContent = "🔥 Analyzing Trends & Generating...";
      else if (mode === GeneratorMode.CRAZY) displayContent = "⚡ Going Crazy Mode...";
      else if (mode === GeneratorMode.KPOP_RANDOM) displayContent = "✨ Generating K-Pop Hit...";
      else if (mode === GeneratorMode.KPOP_3_VOICES) displayContent = "👥 Generating Trio Track...";
      else if (mode === GeneratorMode.THINKING) displayContent = `🧠 [Deep Think] ${text || "Complex Masterpiece"}`;
      else if (mode !== GeneratorMode.NORMAL) displayContent = `[${mode}] ${text}`;
      
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: displayContent };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      setIsGenerating(true);
      setErrorToast(null);
      
      if (mode !== GeneratorMode.NORMAL) {
        setIsControlsOpen(false);
        playWoosh();
      }

      const assistantId = (Date.now() + 1).toString();

      try {
        const response = await generateContentResponse(
          text, mode, studioSettings, appSettings, isRadioEdit, hasIntro, lyricsLanguage, historyRef.current, controller.signal
        );
        
        if (controller.signal.aborted) return;

        const responseText = response.text;
        if (responseText) {
          setMessages(prev => [...prev, { id: assistantId, role: 'model', content: responseText }]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          console.debug('Generation aborted');
        } else {
          console.error(err);
          // Detect API Key error to guide user
          const isKeyError = err.message?.includes('API key') || err.message?.includes('403') || err.toString().includes('API_KEY');
          const msg = isKeyError ? "Failed: API Key missing. Check Vercel Env Vars." : "Generation failed. Please try again.";
          setErrorToast(msg);
          setTimeout(() => setErrorToast(null), 5000);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
  }, [moodDarkBright, moodCleanGritty, moodEnergy, vocalGender, vocalTexture, structure, isRadioEdit, hasIntro, lyricsLanguage, playSuccess, playWoosh, appSettings]);

  const handleRemix = (song: ParsedSong, type: 'lyrics' | 'style' | 'hard') => {
      let prompt = '';
      if (type === 'lyrics') prompt = `REMIX LYRICS for "${song.title}" (${song.style}). Keep structure, new words.`;
      else if (type === 'style') prompt = `REMIX STYLE for "${song.title}". Keep lyrics. New Genre/Vibe.`;
      else prompt = `HARD REMIX "${song.title}". Total transformation.`;
      handleSend(prompt);
  };

  const toggleHelp = (key: HelpSectionKey) => {
    playClick();
    setActiveHelp(activeHelp === key ? null : key);
  };

  const toggleControls = () => {
    playWoosh();
    setIsControlsOpen(!isControlsOpen);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white relative">
      
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 z-0 bg-dynamic pointer-events-none opacity-40" />

      {/* 1. Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl z-40 relative">
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all ${isGenerating ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'}`} />
           <span className="font-semibold tracking-tight text-sm text-zinc-200">SUMINI <span className="text-zinc-600 font-normal ml-1">ARCHITECT</span></span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
           {/* Studio Toggle */}
           <button 
              onClick={toggleControls}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border
                ${isControlsOpen 
                  ? 'bg-zinc-100 border-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/20 hover:text-zinc-200'}
              `}
           >
              {isControlsOpen ? <ChevronUp size={12} /> : <SlidersHorizontal size={12} />}
              <span className="hidden sm:inline">{isControlsOpen ? 'Hide Studio' : 'Open Studio'}</span>
              <span className="sm:hidden">Studio</span>
           </button>

           <div className="w-px h-4 bg-white/10 mx-1" />

           <button onClick={() => { playClick(); setIsSettingsOpen(true); }} className="group text-zinc-500 hover:text-zinc-200 transition-colors" title="Settings">
              <Settings2 size={16} className="group-hover:rotate-90 transition-transform duration-500" />
           </button>
           <button onClick={handleClear} className="group text-zinc-500 hover:text-red-400 transition-colors" title="Reset Session">
              <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-300" />
           </button>
        </div>
      </header>

      {/* 2. Sliding Glass Controls Deck */}
      <div className={`
          w-full z-30 glass-panel shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top
          ${isControlsOpen ? 'max-h-[70vh] opacity-100 border-b border-white/10' : 'max-h-0 opacity-0 border-none pointer-events-none'}
      `}>
         <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-8">
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Col 1: Mood */}
                <div className="space-y-6 relative">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                      <SlidersHorizontal size={10}/> Mood Dynamics
                      <HelpButton ref={helpTriggerRefs.mood} onClick={() => toggleHelp('mood')} isActive={activeHelp === 'mood'} />
                    </div>
                    
                    <div className="space-y-6">
                      <Knob value={moodDarkBright} onChange={setMoodDarkBright} label="Tone" leftLabel="Dark" rightLabel="Bright" />
                      <Knob value={moodEnergy} onChange={setMoodEnergy} label="Energy" leftLabel="Chill" rightLabel="Hype" />
                      <Knob value={moodCleanGritty} onChange={setMoodCleanGritty} label="Texture" leftLabel="Clean" rightLabel="Gritty" />
                    </div>
                </div>

                {/* Col 2: Voice */}
                <div className="space-y-6 relative">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                      <Mic2 size={10}/> Vocal Chain
                      <HelpButton ref={helpTriggerRefs.vocal} onClick={() => toggleHelp('vocal')} isActive={activeHelp === 'vocal'} />
                    </div>

                    <div className="space-y-3">
                      <GlassSelect value={vocalGender} onChange={(e) => { playClick(); setVocalGender(e.target.value as any); }}>
                        <option value="Any">Any Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Duet">Duet</option>
                        <option value="AI/Robotic">Robotic</option>
                      </GlassSelect>
                      <GlassSelect value={vocalTexture} onChange={(e) => { playClick(); setVocalTexture(e.target.value as any); }}>
                        <option value="Any">Any Texture</option>
                        <option value="Airy">Airy</option>
                        <option value="Raspy">Raspy</option>
                        <option value="Auto-Tuned">Auto-Tuned</option>
                      </GlassSelect>
                      <GlassSelect value={lyricsLanguage} onChange={(e) => { playClick(); setLyricsLanguage(e.target.value as any); }}>
                        <option value="English">English</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Mixed (Arabic/English)">Mixed</option>
                      </GlassSelect>
                    </div>
                </div>

                {/* Col 3: Structure */}
                <div className="space-y-6 relative">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                      <LayoutTemplate size={10}/> Structure
                      <HelpButton ref={helpTriggerRefs.structure} onClick={() => toggleHelp('structure')} isActive={activeHelp === 'structure'} />
                    </div>

                    <GlassSelect value={structure} onChange={(e) => { playClick(); setStructure(e.target.value as any); }}>
                      <option value="Auto">Auto-Detect</option>
                      <option value="Pop Standard">Pop Structure</option>
                      <option value="Rap/Trap">Trap / Hip-Hop</option>
                      <option value="EDM/Club">EDM / Club</option>
                      <option value="Mahraganat">Mahraganat</option>
                    </GlassSelect>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <TogglePill label="Intro" active={hasIntro} onClick={() => setHasIntro(!hasIntro)} />
                      <TogglePill label="Radio Edit" active={isRadioEdit} onClick={() => setIsRadioEdit(!isRadioEdit)} />
                    </div>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-5 pl-1">
                   <Sparkles size={10}/> Creative Modes
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                   <ModeButton icon={<BrainCircuit size={16} />} label="Deep Think" onClick={() => handleSend(input, GeneratorMode.THINKING)} colorClass="group-hover:text-cyan-400" />
                   <ModeButton icon={<Flame size={16} />} label="Trending" onClick={() => handleSend('', GeneratorMode.TRENDING)} colorClass="group-hover:text-orange-400" />
                   <ModeButton icon={<Dice5 size={16} />} label="Hit Me" onClick={() => handleSend('', GeneratorMode.RANDOM)} colorClass="group-hover:text-green-400" />
                   <ModeButton icon={<Zap size={16} />} label="Crazy" onClick={() => handleSend('', GeneratorMode.CRAZY)} colorClass="group-hover:text-purple-400" />
                   <ModeButton icon={<Music2 size={16} />} label="K-Pop" onClick={() => handleSend('', GeneratorMode.KPOP_RANDOM)} colorClass="group-hover:text-pink-400" />
                   <ModeButton icon={<Users size={16} />} label="Trio" onClick={() => handleSend('', GeneratorMode.KPOP_3_VOICES)} colorClass="group-hover:text-blue-400" />
                </div>
             </div>
         </div>
      </div>

      {/* 3. Main Chat */}
      <div className="flex-1 overflow-hidden relative flex flex-col z-10 w-full">
        <MessageList messages={messages} isLoading={isLoading} onRemix={handleRemix} />
        {/* Soft fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
      </div>

      {/* 4. Glass Input Deck */}
      <div className="z-30 w-full flex justify-center pb-6 px-4 bg-transparent pb-safe shrink-0">
        <div className="w-full max-w-3xl relative">
          <div className="relative flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl p-1.5 pl-3 rounded-[32px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 focus-within:bg-white/[0.05] focus-within:border-indigo-500/30 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-slide-up z-30 group">
             
             <button 
                onClick={handleEnhance} 
                disabled={!input.trim() || isEnhancing} 
                className={`p-2 rounded-full transition-all duration-300 shrink-0 hover:bg-indigo-500/20 active:scale-95 ${input ? 'text-indigo-400' : 'text-zinc-600'}`}
                title="AI Magic Enhance"
             >
                <Wand2 size={18} className={isEnhancing ? 'animate-spin' : ''} />
             </button>

             <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(input))}
               placeholder="Describe your song idea..."
               className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 py-3 max-h-32 min-h-[48px] focus:outline-none resize-none text-[15px] leading-relaxed font-light"
               rows={1}
               disabled={isGenerating}
             />

             <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isGenerating}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 ${input.trim() ? 'bg-zinc-100 text-black hover:bg-white hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-zinc-600'}`}
             >
                {isGenerating ? <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" /> : <Send size={18} className="ml-0.5" />}
             </button>
          </div>
          
          <div className="text-center mt-3 hidden sm:block">
             <p className="text-[10px] text-zinc-600 font-mono tracking-widest opacity-60">AI MUSIC ARCHITECT • SUNO v4.5</p>
          </div>
        </div>
      </div>

      {/* Popups & Panels */}
      <HelpPopup section="mood" isOpen={activeHelp === 'mood'} onClose={() => setActiveHelp(null)} triggerRef={helpTriggerRefs.mood} />
      <HelpPopup section="vocal" isOpen={activeHelp === 'vocal'} onClose={() => setActiveHelp(null)} triggerRef={helpTriggerRefs.vocal} />
      <HelpPopup section="structure" isOpen={activeHelp === 'structure'} onClose={() => setActiveHelp(null)} triggerRef={helpTriggerRefs.structure} />
      
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isDevMode={isDevMode} />

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md z-[100] animate-slide-up cursor-pointer hover:bg-red-500/20" onClick={() => setErrorToast(null)}>
           <AlertCircle size={14} />
           <span className="text-xs font-bold">{errorToast}</span>
        </div>
      )}

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  );
};

export default App;