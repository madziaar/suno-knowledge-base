
import React, { useEffect, useCallback, Suspense, useState, useMemo } from 'react';
import { Terminal, Sparkles, Loader2, Settings, Download } from 'lucide-react';
import PromptBuilder from './features/generator/PromptBuilder'; 
import Navbar from './components/layout/Navbar';
import MobileDock from './components/layout/MobileDock';
import Background from './components/layout/Background';
import Toast from './components/shared/Toast';
import OnboardingTour from './features/onboarding/OnboardingTour';
import { translations } from './translations';
import { useSettingsState, useSettingsDispatch, useUIState, useUIDispatch, useHistoryDispatch, usePrompt } from './contexts';
import SettingsModal from './components/shared/SettingsModal';
import { APP_VERSION } from './lib/constants';
import { GenreTemplate, ProducerPersona } from './types';
import { useKeyboardShortcuts, decompressState } from './lib/utils';
import { useAudio } from './contexts/AudioContext';
import { cn } from './lib/utils';
import { useKonamiCode, usePWA } from './hooks';

const ReferenceGuide = React.lazy(() => import('./features/guide/ReferenceGuide'));
const History = React.lazy(() => import('./features/history/History'));
const DocsViewer = React.lazy(() => import('./features/docs/DocsViewer'));
const GenreExplorer = React.lazy(() => import('./features/templates/GenreExplorer'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
  </div>
);

const App = () => {
  const { lang, isOverclockedMode } = useSettingsState();
  const { setLang, setIsOverclockedMode } = useSettingsDispatch();
  
  const { activeTab, toast, isSettingsModalOpen } = useUIState();
  const { setActiveTab, showToast, dismissToast, openSettings, closeSettings } = useUIDispatch();
  
  const { loadFromHistory, loadFromTemplate, deleteFromHistory, clearHistory, exportHistory } = useHistoryDispatch();
  const { undo, redo, setState: setPromptState, inputs } = usePrompt(); 

  const { play } = useAudio();
  
  // Safe translation access with fallback to 'en'
  const t = useMemo(() => translations[lang] || translations['en'], [lang]);
  
  const { isUpdateAvailable, updateApp } = usePWA();
  const [footerClicks, setFooterClicks] = useState(0);

  // Sync Body Classes for Personas
  useEffect(() => {
    const personaClass = `persona-${inputs.producerPersona || 'standard'}`;
    // Remove all previous persona classes
    document.body.classList.forEach(cls => {
      if (cls.startsWith('persona-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(personaClass);
    document.body.classList.toggle('pyrite-mode', isOverclockedMode);
  }, [inputs.producerPersona, isOverclockedMode]);

  useEffect(() => {
    const initShare = async () => {
      const params = new URLSearchParams(window.location.search);
      const forgeData = params.get('forge');
      if (forgeData) {
        const decoded = await decompressState(forgeData);
        if (decoded) {
          setPromptState({ 
            inputs: decoded.inputs, 
            expertInputs: decoded.expertInputs, 
            isExpertMode: decoded.isExpertMode,
          });
          setIsOverclockedMode(decoded.isPyriteMode);
          
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => {
             showToast(t.toast?.linkLoaded || "Neural Link Established", 'success');
             play('success');
          }, 1000);
        }
      }
    };
    initShare();
  }, [lang, play, setPromptState, setIsOverclockedMode, showToast, t]);

  useEffect(() => {
    if (isUpdateAvailable && t.toast?.newVersion) {
        showToast(t.toast.newVersion, 'info');
    }
  }, [isUpdateAvailable, showToast, t]);

  const handleExportHistory = useCallback(() => {
    const result = exportHistory();
    showToast(result.message, result.success ? 'success' : 'info');
  }, [exportHistory, showToast]);

  const toggleOverclock = useCallback(() => {
      play('toggle');
      setIsOverclockedMode(!isOverclockedMode);
      const tToast = t.toast;
      showToast(!isOverclockedMode ? (tToast?.pyriteOn || "OVERCLOCK ON") : (tToast?.pyriteOff || "OVERCLOCK OFF"), 'info');
  }, [play, showToast, isOverclockedMode, setIsOverclockedMode, t.toast]);

  const toggleLang = useCallback(() => { 
      setLang(prev => prev === 'en' ? 'pl' : 'en');
      play('click');
  }, [setLang, play]);

  useKonamiCode(() => {
    setIsOverclockedMode(true);
    if (t.toast?.konamiSuccess) {
      showToast(t.toast.konamiSuccess, 'success');
    }
    play('secret');
  });

  const handleFooterClick = useCallback(() => {
    const newCount = footerClicks + 1;
    setFooterClicks(newCount);
    if (newCount === 7) {
      if (t.toast?.footerPoke) {
        showToast(t.toast.footerPoke, 'info');
      }
      play('light');
      setFooterClicks(0);
    }
  }, [footerClicks, showToast, play, t.toast]);

  const handleOpenSettings = useCallback(() => {
      play('click');
      openSettings();
  }, [play, openSettings]);

  const handleLoadTemplate = useCallback((template: GenreTemplate) => {
    loadFromTemplate(template);
    setActiveTab('forge');
  }, [loadFromTemplate, setActiveTab]);

  useKeyboardShortcuts([
    { key: 'p', ctrlKey: true, handler: toggleOverclock, allowInInput: false },
    { key: 'z', ctrlKey: true, handler: undo, allowInInput: true },
    { key: 'y', ctrlKey: true, handler: redo, allowInInput: true },
    { key: ',', ctrlKey: true, handler: handleOpenSettings, allowInInput: false },
  ]);

  const personaThemeColors = useMemo(() => {
    const p = inputs.producerPersona;
    if (p === 'pyrite') return 'border-purple-500/30 bg-purple-900/10 shadow-[0_0_40px_rgba(168,85,247,0.1)]';
    if (p === 'shin') return 'border-red-500/30 bg-red-950/10 shadow-[0_0_40px_rgba(220,38,38,0.1)]';
    if (p === 'twin_flames') return 'border-pink-500/30 bg-pink-900/10 shadow-[0_0_40px_rgba(219,39,119,0.1)]';
    return 'border-yellow-500/10 bg-gradient-to-b from-yellow-500/5 to-transparent';
  }, [inputs.producerPersona]);

  const personaLabelColors = useMemo(() => {
    const p = inputs.producerPersona;
    if (p === 'pyrite') return 'text-purple-400';
    if (p === 'shin') return 'text-red-500';
    if (p === 'twin_flames') return 'text-pink-400';
    return 'text-yellow-500';
  }, [inputs.producerPersona]);

  return (
    <div className={cn(
        "min-h-screen transition-colors duration-700 ease-in-out overflow-x-hidden relative flex flex-col",
        isOverclockedMode ? 'bg-[#050505]' : 'bg-zinc-950'
    )}>
      <Background isPyriteMode={isOverclockedMode} />
      <OnboardingTour isPyriteMode={isOverclockedMode} lang={lang} />
      <Navbar />

      <main className="relative z-10 flex-1 pt-24 pb-48 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className={cn(
            "mb-6 p-1 rounded-2xl border backdrop-blur-md transition-all duration-500 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4",
            personaThemeColors
        )}>
          <div className={cn(
              "p-4 rounded-xl border",
              isOverclockedMode ? 'border-white/5 bg-black/40' : 'border-white/5 bg-zinc-900/40'
          )}>
            <h2 className={cn(
                "font-bold flex items-center gap-2 text-xs md:text-sm mb-2 tracking-tight",
                personaLabelColors
            )}>
                <Terminal className="w-3 h-3 md:w-4 md:h-4" />
                {isOverclockedMode ? t.nav.pyriteActive : t.system.title}
            </h2>
            <p className={cn(
                "text-[10px] md:text-xs leading-relaxed",
                isOverclockedMode ? 'text-zinc-200/70 font-mono' : 'text-zinc-400'
            )}>
                {isOverclockedMode ? t.system.pyriteMsg : t.system.msg}
            </p>
          </div>
        </div>

        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Suspense fallback={<LoadingFallback />}>
                {(activeTab === 'forge' || activeTab === 'studio') && <PromptBuilder viewMode={activeTab} />}
                {activeTab === 'guide' && <ReferenceGuide lang={lang} showToast={showToast} />}
                {activeTab === 'history' && <History />}
                {activeTab === 'docs' && <DocsViewer isPyriteMode={isOverclockedMode} />}
                {activeTab === 'templates' && <GenreExplorer lang={lang} isPyriteMode={isOverclockedMode} onLoadTemplate={handleLoadTemplate} />}
            </Suspense>
        </div>
      </main>

      <MobileDock />

      <footer className="hidden md:block py-10 text-center text-zinc-600 text-sm border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-center gap-2 mb-2">
            <p className="font-medium tracking-wide">{t.system.footer}</p>
        </div>
        <p 
          onClick={handleFooterClick}
          className={cn("text-xs opacity-50 font-mono cursor-pointer transition-colors hover:text-white", isOverclockedMode && "text-purple-500 font-bold glitch-text")} 
          data-text={t.system.persona}
        >
          {t.system.persona} <span className="ml-2">({APP_VERSION})</span>
        </p>
      </footer>

      <Toast 
        toast={toast} 
        isPyriteMode={isOverclockedMode} 
        onDismiss={() => {
            if (isUpdateAvailable) updateApp();
            dismissToast();
        }} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={closeSettings}
      />
    </div>
  );
};

export default App;
