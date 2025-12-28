import React, { useCallback, useState } from 'react';
import { X, Settings, Languages, Palette, HardDrive, Download, Cloud, RefreshCw, Copy, Check, Gauge, UserCog, BookOpen, Zap } from 'lucide-react';
import GlassPanel from './GlassPanel';
import ThemedButton from './ThemedButton';
import { cn } from '../../lib/utils';
import { Language, PerformanceMode, ProducerPersona } from '../../types';
import { usePWA } from '../../hooks';
import { useHistoryDispatch, useHistoryState } from '../../contexts';
import { useSettingsState, useSettingsDispatch } from '../../contexts';
import { useUIDispatch, usePromptState, usePromptActions } from '../../contexts';
import { translations } from '../../translations';
import PersonaSelector from './PersonaSelector';
import PersonaManagerModal from './PersonaManagerModal';
import { sfx } from '../../lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lang, isOverclockedMode, performanceMode } = useSettingsState();
  const { setLang, setIsOverclockedMode, setPerformanceMode } = useSettingsDispatch();
  const { showToast } = useUIDispatch();
  const { cloudConfig, syncStatus } = useHistoryState();
  const { setCloudConfig, pushHistoryToCloud, pullHistoryFromCloud } = useHistoryDispatch();
  const { isInstallable, installApp } = usePWA();
  
  const [isPersonaManagerOpen, setIsPersonaManagerOpen] = useState(false);
  
  // Access Prompt Context
  const { inputs } = usePromptState();
  const { updateInput } = usePromptActions();
  
  const t = translations[lang];
  const ts = t.settings;
  const tc = ts.cloud;

  const handleCopyId = useCallback(() => {
    if(cloudConfig.syncId) {
        navigator.clipboard.writeText(cloudConfig.syncId);
        showToast(t.toast.copied, 'success');
    }
  }, [cloudConfig.syncId, showToast, t.toast.copied]);

  const handlePersonaChange = (persona: ProducerPersona) => {
      updateInput({ producerPersona: persona });
  };

  if (!isOpen) return null;

  const handleClearAllData = () => {
    if (window.confirm(ts.clearConfirm)) {
      localStorage.clear();
      showToast(ts.clearSuccess, 'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleSetLanguage = (newLang: Language) => {
    setLang(newLang);
    showToast(`${ts.languageSet} ${newLang.toUpperCase()}`, 'info');
  };

  const handleSetOverclock = (overclock: boolean) => {
    setIsOverclockedMode(overclock);
    showToast(overclock ? t.toast.pyriteOn : t.toast.pyriteOff, 'info');
  };
  
  const handleSetPerformance = (mode: PerformanceMode) => {
      setPerformanceMode(mode);
      const labels = { low: ts.perfLow, medium: ts.perfBalanced, high: ts.perfHigh };
      showToast(`${ts.performance}: ${labels[mode]}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <GlassPanel variant={isOverclockedMode ? 'pyrite' : 'default'} className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <Settings className="w-4 h-4" />
            {ts.title}
          </h3>
          <button onClick={onClose} className="p-1 hover:text-white text-zinc-500" aria-label={ts.close}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          
          {/* Active Persona */}
          <section>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCog className="w-4 h-4" />
                    Active Producer Identity
                </h4>
                <button 
                    onClick={() => { setIsPersonaManagerOpen(true); sfx.play('click'); }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-tighter"
                >
                    <BookOpen className="w-3 h-3" />
                    Manage Custom Agents
                </button>
            </div>
            <div className="w-full">
                <PersonaSelector 
                    value={inputs.producerPersona || 'standard'} 
                    onChange={handlePersonaChange}
                    className="w-full"
                />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
                Defines the AI's creative personality and stylistic biases.
            </p>
          </section>

          {/* Overclocked Mode (Safety Filter) */}
          <section>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Overclocked Protocol
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ThemedButton 
                onClick={() => handleSetOverclock(true)} 
                variant={isOverclockedMode ? 'pyrite' : 'zinc'}
                className={cn("py-3", !isOverclockedMode && "border border-purple-500/20 text-purple-400 hover:bg-purple-900/10")}
              >
                Engage (No Limits)
              </ThemedButton>
              <ThemedButton 
                onClick={() => handleSetOverclock(false)} 
                variant={!isOverclockedMode ? 'default' : 'zinc'}
                className={cn("py-3", isOverclockedMode && "border border-yellow-500/20 text-yellow-500 hover:bg-yellow-900/10")}
              >
                Standard (Safety On)
              </ThemedButton>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
                Overclocked mode removes content restrictions and safety filters from AI generation. Use with creative caution.
            </p>
          </section>

          {/* Performance Mode */}
          <section>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              {ts.performance}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <ThemedButton 
                onClick={() => handleSetPerformance('low')} 
                variant={performanceMode === 'low' ? (isOverclockedMode ? 'pyrite' : 'default') : 'zinc'}
                className="py-3 text-[10px] md:text-xs"
              >
                {ts.perfLow}
              </ThemedButton>
              <ThemedButton 
                onClick={() => handleSetPerformance('medium')} 
                variant={performanceMode === 'medium' ? (isOverclockedMode ? 'pyrite' : 'default') : 'zinc'}
                className="py-3 text-[10px] md:text-xs"
              >
                {ts.perfBalanced}
              </ThemedButton>
              <ThemedButton 
                onClick={() => handleSetPerformance('high')} 
                variant={performanceMode === 'high' ? (isOverclockedMode ? 'pyrite' : 'default') : 'zinc'}
                className="py-3 text-[10px] md:text-xs"
              >
                {ts.perfHigh}
              </ThemedButton>
            </div>
          </section>

          {/* Language Selector */}
          <section>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {ts.language}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ThemedButton 
                onClick={() => handleSetLanguage('en')} 
                variant={lang === 'en' ? (isOverclockedMode ? 'pyrite' : 'default') : 'zinc'}
                className="py-3"
                aria-label={ts.setEnglish}
              >
                English
              </ThemedButton>
              <ThemedButton 
                onClick={() => handleSetLanguage('pl')} 
                variant={lang === 'pl' ? (isOverclockedMode ? 'pyrite' : 'default') : 'zinc'}
                className="py-3"
                aria-label={ts.setPolish}
              >
                Polski
              </ThemedButton>
            </div>
          </section>

          {/* PWA Install (Only if available) */}
          {isInstallable && (
            <section>
               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {ts.installTitle}
               </h4>
               <ThemedButton 
                  onClick={installApp} 
                  variant="zinc"
                  className="w-full py-4 text-sm"
                  icon={<Download className="w-4 h-4" />}
               >
                  {ts.installButton}
               </ThemedButton>
            </section>
          )}

          {/* Neural Cloud Section */}
          <section className="pb-6 border-b border-white/10">
             <div className="flex items-center justify-between mb-3">
                 <h4 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isOverclockedMode ? "text-purple-400" : "text-blue-400")}>
                    <Cloud className="w-4 h-4" />
                    {tc.title}
                 </h4>
                 <div className={cn("text-[10px] font-bold px-2 py-1 rounded border uppercase", 
                     syncStatus === 'success' ? "text-green-400 border-green-500/30 bg-green-500/10" : 
                     syncStatus === 'error' ? "text-red-400 border-red-500/30 bg-red-500/10" : 
                     syncStatus === 'syncing' ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : 
                     "text-zinc-500 border-zinc-700 bg-zinc-800"
                 )}>
                     {tc.status[syncStatus]}
                 </div>
             </div>
             
             <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{tc.desc}</p>
             
             <div className="space-y-3 mb-4">
                 <div className="space-y-1">
                     <label className="text-[10px] font-bold text-zinc-500 uppercase">{tc.idLabel}</label>
                     <div className="flex gap-2">
                         <input 
                            value={cloudConfig.syncId || ''}
                            onChange={(e) => setCloudConfig(p => ({...p, syncId: e.target.value}))}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:border-white/30 outline-none"
                         />
                         <button onClick={handleCopyId} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-zinc-400">
                             <Copy className="w-4 h-4" />
                         </button>
                     </div>
                 </div>

                 <input 
                    value={cloudConfig.url || ''}
                    onChange={(e) => setCloudConfig(p => ({...p, url: e.target.value}))}
                    placeholder={tc.urlPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:border-white/30 outline-none"
                 />
                 <input 
                    type="password"
                    value={cloudConfig.key || ''}
                    onChange={(e) => setCloudConfig(p => ({...p, key: e.target.value}))}
                    placeholder={tc.keyPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:border-white/30 outline-none"
                 />
             </div>

             <div className="flex gap-2">
                 <ThemedButton 
                    onClick={pushHistoryToCloud}
                    disabled={syncStatus === 'syncing' || !cloudConfig.url}
                    variant="zinc"
                    className="flex-1 py-2 text-xs h-auto"
                    icon={<RefreshCw className={cn("w-3.5 h-3.5", syncStatus === 'syncing' && "animate-spin")} />}
                 >
                    {tc.push}
                 </ThemedButton>
                 <ThemedButton 
                    onClick={pullHistoryFromCloud}
                    disabled={syncStatus === 'syncing' || !cloudConfig.url}
                    variant={isOverclockedMode ? 'pyrite' : 'default'}
                    className="flex-1 py-2 text-xs h-auto"
                    icon={<Download className="w-3.5 h-3.5" />}
                 >
                    {tc.pull}
                 </ThemedButton>
             </div>
          </section>

          {/* Clear All Local Data */}
          <section className="pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              {ts.clearData}
            </h4>
            <p className="text-sm text-zinc-400 mb-4">
              {ts.clearConfirm}
            </p>
            <ThemedButton 
              onClick={handleClearAllData} 
              variant="zinc" 
              className="bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-900/50 py-3"
              aria-label={ts.clearData}
            >
              <X className="w-4 h-4 mr-2" />
              {ts.clearData}
            </ThemedButton>
          </section>

        </div>
      </GlassPanel>

      <PersonaManagerModal 
        isOpen={isPersonaManagerOpen} 
        onClose={() => setIsPersonaManagerOpen(false)} 
      />
    </div>
  );
};

export default SettingsModal;