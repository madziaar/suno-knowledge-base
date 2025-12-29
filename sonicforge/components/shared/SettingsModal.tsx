
import React, { useCallback, useState } from 'react';
import { X, Settings, Languages, Palette, HardDrive, Download, Cloud, RefreshCw, Copy, Check, Gauge, UserCog, BookOpen, Zap, ShieldCheck } from 'lucide-react';
import GlassPanel from './GlassPanel';
import ThemedButton from './ThemedButton';
import { Switch } from '../ui/Switch';
import { cn } from '../../lib/utils';
import { Language, PerformanceMode } from '../../types';
import { useSettingsState, useSettingsDispatch } from '../../contexts/SettingsContext';
import { translations } from '../../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fix: Provide full component implementation and default export.
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lang, performanceMode, warnerOptIn, isOverclockedMode } = useSettingsState();
  const { setLang, setPerformanceMode, setWarnerOptIn } = useSettingsDispatch();
  const t = translations[lang].settings;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <GlassPanel variant="default" className="w-full max-w-lg shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <Languages className="w-4 h-4" />
              {t.language}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLang('en')}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  lang === 'en' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                English
              </button>
              <button
                onClick={() => setLang('pl')}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  lang === 'pl' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                Polski
              </button>
            </div>
          </div>

          {/* Performance Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <Gauge className="w-4 h-4" />
              {t.performance}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'balanced', 'high'] as PerformanceMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPerformanceMode(mode)}
                  className={cn(
                    "p-2 rounded-xl border text-xs font-bold uppercase transition-all",
                    performanceMode === mode ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  {mode === 'low' ? t.perfLow : mode === 'balanced' ? t.perfBalanced : t.perfHigh}
                </button>
              ))}
            </div>
          </div>
          
          {/* Warner Opt-In */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Legal Compliance
            </div>
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-200">Warner Music Artist Opt-In</span>
                    <span className="text-[10px] text-zinc-500">Restrict training data to licensed WMG sets (v5 Safe).</span>
                </div>
                <Switch 
                    checked={warnerOptIn} 
                    onChange={setWarnerOptIn}
                    isPyrite={isOverclockedMode}
                />
            </label>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
          <ThemedButton onClick={onClose} variant="zinc" className="px-6">
            {t.close}
          </ThemedButton>
        </div>
      </GlassPanel>
    </div>
  );
};

export default SettingsModal;
