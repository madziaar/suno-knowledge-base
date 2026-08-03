
import React, { useEffect, useCallback, Suspense, useState } from 'react';
import { Terminal, Sparkles, Loader2, Settings, Download } from 'lucide-react';
import PromptBuilder from './features/generator/PromptBuilder'; 
import Navbar from './components/layout/Navbar';
import MobileDock from './components/layout/MobileDock';
import Background from './components/layout/Background';
import Toast from './components/shared/Toast';
import OnboardingTour from './features/onboarding/OnboardingTour';
import { translations } from './translations';
import { useKeyboardShortcuts } from './lib/keyboard-shortcuts';
import { decompressState } from './lib/sharing';
import { useAudio } from './contexts/AudioContext';
import { cn } from './lib/utils';
import { useSettings, useUI, useHistory, usePrompt } from './contexts';
import SettingsModal from './components/shared/SettingsModal';
import { APP_VERSION } from './lib/constants';
import { useKonamiCode } from './hooks/useKonamiCode';
import { usePWA } from './hooks/usePWA';

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
  // CONTEXT-BASED STATE MANAGEMENT
  const { lang, setLang, isPyriteMode, setIsPyriteMode } = useSettings();
  const { 
    activeTab, 
    setActiveTab, 
    setGeneratorState, 
    toast, 
    showToast, 
    dismissToast,
    isSettingsModalOpen, // From UIContext
    openSettings,        // From UIContext
    closeSettings        // From UIContext
  } = useUI();
  
  const { 
    loadFromHistory, 
    loadFromTemplate,
    deleteFromHistory,
    clearHistory,
    exportHistory
  } = useHistory();
  const { undo, redo, setState: setPromptState } = usePrompt(); 

  const { play } = useAudio();
  const t = translations[lang];
  const { isUpdateAvailable, updateApp } = usePWA();

  const [footerClicks, setFooterClicks] = useState(0);

  // --- ORCHESTRATION & SIDE EFFECTS ---

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
          setIsPyriteMode(decoded.isPyriteMode);
          
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => {
             showToast(translations[lang].toast?.linkLoaded || "Neural Link Established", 'success');
             play('success');
          }, 1000);
        }
      }
    };
    initShare();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PWA Update Notification
  useEffect(() => {
    if (isUpdateAvailable) {
        showToast(translations[lang].toast.newVersion, 'info');
    }
  }, [isUpdateAvailable, showToast, lang]);

  const handleExportHistory = useCallback(() => {
    const result = exportHistory();
    showToast(result.message, result.success ? 'success' : 'info');
  }, [exportHistory, showToast]);

  const togglePyrite = useCallback(() => {
      play('toggle');
      setIsPyriteMode(!isPyriteMode);
      const tToast = translations[lang].toast;
      showToast(!isPyriteMode ? (tToast?.pyriteOn || "PYRITE ON") : (tToast?.pyriteOff || "PYRITE OFF"), 'info');
  }, [play, lang, showToast, isPyriteMode, setIsPyriteMode]);

  const toggleLang = useCallback(() => { 
      setLang(prev => prev === 'en' ? 'pl' : 'en');
      play('click');
  }, [setLang, play]);

  // --- EASTER EGGS ---

  useKonamiCode(() => {
    setIsPyriteMode(true);
    showToast(t.toast.konamiSuccess, 'success');
    play('secret');
  });

  const handleFooterClick = useCallback(() => {
    const newCount = footerClicks + 1;
    setFooterClicks(newCount);
    if (newCount === 7) {
      showToast(t.toast.footerPoke, 'info');
      play('light');
      setFooterClicks(0);
    }
  }, [footerClicks, showToast, play, t.toast.footerPoke]);


  useKeyboardShortcuts([
    { key: 'p', ctrlKey: true, handler: togglePyrite, allowInInput: false },
    { key: 'z', ctrlKey: true, handler: undo, allowInInput: true },
    { key: 'y', ctrlKey: true, handler: redo, allowInInput: true },
    { key: ',', ctrlKey: true, handler: openSettings, allowInInput: false },
  ]);

  return (
    <div className={cn(
        "min-h-screen transition-colors duration-700 ease-in-out overflow-x-hidden relative",
        isPyriteMode ? 'bg-[#050505] pyrite-mode font-mono selection:bg-purple-500/30' : 'bg-zinc-950 selection:bg-yellow-500/30'
    )}>
      
      <Background isPyriteMode={isPyriteMode} />
      
      <OnboardingTour isPyriteMode={isPyriteMode} lang={lang} />

      <Navbar 
        togglePyrite={togglePyrite} 
        toggleLang={toggleLang}
        openSettings={openSettings} 
      />

      <main className="relative z-10 pt-24 pb-32 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <div className={cn(
            "mb-6 p-1 rounded-2xl border backdrop-blur-md transition-all duration-500 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4",
            isPyriteMode 
            ? 'border-purple-500/30 bg-purple-900/10 shadow-[0_0_40px_rgba(168,85,247,0.1)]' 
            : 'border-yellow-500/10 bg-gradient-to-b from-yellow-500/5 to-transparent'
        )}>
          <div className={cn(
              "p-4 rounded-xl border",
              isPyriteMode ? 'border-purple-500/10 bg-black/40' : 'border-white/5 bg-zinc-900/40'
          )}>
            <h2 className={cn(
                "font-bold flex items-center gap-2 text-sm mb-2 tracking-tight",
                isPyriteMode ? 'text-purple-400 font-mono' : 'text-yellow-500'
            )}>
                <Terminal className="w-4 h-4" />
                {isPyriteMode ? t.nav.pyriteActive : t.system.title}
            </h2>
            <p className={cn(
                "text-xs leading-relaxed",
                isPyriteMode ? 'text-purple-200/70 font-mono' : 'text-zinc-400'
            )}>
                {isPyriteMode ? t.system.pyriteMsg : t.system.msg}
            </p>
          </div>
        </div>

        <div 
            key={activeTab} 
            className="animate-in fade-in slide-in-from-bottom-8 duration-500"
        >
            <Suspense fallback={<LoadingFallback />}>
                {/* Render PromptBuilder for both Forge and Studio tabs */}
                {(activeTab === 'forge' || activeTab === 'studio') && (
                    <PromptBuilder viewMode={activeTab} />
                )}
                {activeTab === 'guide' && <ReferenceGuide lang={lang} showToast={showToast} />}
                {activeTab === 'history' && (
                    <History 
                        lang={lang} 
                        onLoad={loadFromHistory}
                        onDelete={deleteFromHistory}
                        onClear={clearHistory}
                        onExportAll={handleExportHistory}
                        onSwitchToForge={() => setActiveTab('forge')}
                    />
                )}
                {activeTab === 'docs' && (
                    <DocsViewer isPyriteMode={isPyriteMode} />
                )}
                {activeTab === 'templates' && (
                  <GenreExplorer 
                    lang={lang} 
                    onLoadTemplate={loadFromTemplate} 
                    isPyriteMode={isPyriteMode} 
                  />
                )}
            </Suspense>
        </div>
      </main>

      <MobileDock />

      <footer className="hidden md:block py-10 mt-12 text-center text-zinc-600 text-sm border-t border-white/5">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 opacity-50" />
            <p className="font-medium tracking-wide">{t.system.footer}</p>
        </div>
        <p 
          onClick={handleFooterClick}
          className={cn("text-xs opacity-50 font-mono cursor-pointer transition-colors hover:text-white", isPyriteMode && "text-purple-500 font-bold glitch-text")} 
          data-text={t.system.persona}
        >
          {t.system.persona} <span className="ml-2">({APP_VERSION})</span>
        </p>
      </footer>

      {/* Manual toast handler for update click */}
      <Toast 
        toast={toast} 
        isPyriteMode={isPyriteMode} 
        onDismiss={() => {
            if (isUpdateAvailable) {
                updateApp();
            }
            dismissToast();
        }} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={closeSettings}
        isPyriteMode={isPyriteMode}
        lang={lang}
        setLang={setLang}
        setIsPyriteMode={setIsPyriteMode}
        clearHistory={clearHistory}
        showToast={showToast}
        t={t} 
      />
    </div>
  );
};

export default App;
