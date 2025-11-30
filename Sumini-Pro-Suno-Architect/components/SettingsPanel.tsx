import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../context/SettingsContext';
import { useUiSound } from '../hooks/useUiSound';
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../services/geminiService';
import { X, Server, Zap, Smartphone, Download, Upload, Trash2, Loader2, Terminal, Code2, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center gap-2 mb-3 text-indigo-300/80">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
    </div>
    <div className="space-y-3 pl-1">
      {children}
    </div>
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.06] cursor-pointer transition-all group backdrop-blur-sm">
    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
  </label>
);

const Range: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }> = ({ label, value, min, max, step, onChange }) => (
  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all backdrop-blur-sm">
    <div className="flex justify-between mb-3">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <span className="text-xs font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={e => onChange(Number(e.target.value))} 
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, isDevMode }) => {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const { playClick, playSuccess } = useUiSound();
  
  // Connection State
  const [latency, setLatency] = useState<number | null>(null);
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnStatus('testing');
    const start = Date.now();
    try {
      // Use env key directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'ping' });
      const duration = Date.now() - start;
      setLatency(duration);
      setConnStatus('ok');
      playSuccess();
    } catch (e) {
      setConnStatus('error');
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportSettings()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sumini_settings_${Date.now()}.json`;
    a.click();
    playClick();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (importSettings(evt.target?.result as string)) {
        playSuccess();
      } else {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-[#050505]/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className={`
        fixed z-[70] bg-[#09090b]/80 backdrop-blur-3xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col
        md:top-2 md:right-2 md:bottom-2 md:w-[420px] md:border md:rounded-2xl md:animate-slide-in-right
        max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-3xl max-md:max-h-[90vh] max-md:animate-slide-up
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Settings</h2>
            {isDevMode && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 tracking-wide animate-pulse">
                DEV MODE
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-safe">
          
          {/* 1. Status */}
          <SettingSection title="Status" icon={<Server size={16} />}>
             <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">API Connection</span>
                  <span className={`text-xs font-bold ${connStatus === 'ok' ? 'text-green-400' : connStatus === 'error' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {connStatus === 'idle' ? 'Ready' : connStatus === 'testing' ? 'Testing...' : connStatus === 'ok' ? `${latency}ms OK` : 'Error'}
                  </span>
                </div>
                <button 
                  onClick={handleTestConnection}
                  disabled={connStatus === 'testing'}
                  className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-300 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {connStatus === 'testing' ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  Test Connection
                </button>
             </div>
          </SettingSection>

          {/* 2. Generation */}
          <SettingSection title="Generation Engine" icon={<Zap size={16} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => updateSettings({ generation: { modelPreference: 'speed' } })}
                   className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${settings.generation.modelPreference === 'speed' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06]'}`}
                 >
                   <span className="block text-sm font-bold uppercase mb-1">Flash 2.5</span>
                   <span className="block text-[10px] opacity-70">Turbo Speed</span>
                   {settings.generation.modelPreference === 'speed' && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-lg" />}
                 </button>
                 <button 
                   onClick={() => updateSettings({ generation: { modelPreference: 'quality' } })}
                   className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${settings.generation.modelPreference === 'quality' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06]'}`}
                 >
                   <span className="block text-sm font-bold uppercase mb-1">Pro 3.0</span>
                   <span className="block text-[10px] opacity-70">Max Quality</span>
                   {settings.generation.modelPreference === 'quality' && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-lg" />}
                 </button>
              </div>
              <Range 
                label="Temperature (Creativity)" 
                value={settings.generation.temperature} 
                min={0} max={2} step={0.1}
                onChange={(v) => updateSettings({ generation: { temperature: v } })}
              />
            </div>
          </SettingSection>

          {/* 3. UI/UX */}
          <SettingSection title="Interface Experience" icon={<Smartphone size={16} />}>
            <div className="space-y-2">
              <Toggle 
                label="Immersive Sound FX" 
                checked={settings.ui.soundEnabled} 
                onChange={(v) => updateSettings({ ui: { soundEnabled: v } })} 
              />
              <Toggle 
                label="Reduced Motion" 
                checked={settings.ui.reducedMotion} 
                onChange={(v) => updateSettings({ ui: { reducedMotion: v } })} 
              />
            </div>
          </SettingSection>

          {/* 4. Data */}
          <SettingSection title="Data Management" icon={<Download size={16} />}>
             <div className="grid grid-cols-2 gap-3">
               <button onClick={handleExport} className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-300 rounded-xl transition-all active:scale-95">
                 <Download size={14} /> Export JSON
               </button>
               <label className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-300 rounded-xl cursor-pointer transition-all active:scale-95">
                 <Upload size={14} /> Import JSON
                 <input type="file" className="hidden" accept=".json" onChange={handleImport} />
               </label>
             </div>
             <button 
                onClick={() => { if(confirm('Reset all settings to default?')) resetSettings(); }} 
                className="w-full mt-3 py-3 border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Trash2 size={14} /> Factory Reset App
             </button>
          </SettingSection>

          {/* 5. Developer Tools (Hidden) */}
          {isDevMode && (
            <div className="mb-8 pt-6 border-t border-dashed border-indigo-500/30 animate-fade-in">
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Terminal size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Developer Tools</h3>
              </div>
              
              <div className="p-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-4">
                  <Toggle 
                    label="Show Debug Overlay" 
                    checked={settings.developer.showDebug} 
                    onChange={(v) => updateSettings({ developer: { showDebug: v } })} 
                  />
                  
                  <div className="space-y-2">
                    <Toggle 
                      label="Show System Prompt" 
                      checked={settings.developer.showSystemPrompt} 
                      onChange={(v) => updateSettings({ developer: { showSystemPrompt: v } })} 
                    />
                    {settings.developer.showSystemPrompt && (
                      <div className="relative mt-2">
                        <div className="absolute top-2 right-2 text-zinc-500 pointer-events-none">
                          <Code2 size={12} />
                        </div>
                        <div className="p-3 bg-black/50 rounded-lg border border-white/10 text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-48 custom-scrollbar whitespace-pre">
                          {SYSTEM_INSTRUCTION}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => { if(confirm('Reset internal config? (Keys preserved)')) resetSettings(); }} 
                    className="w-full py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     <RotateCcw size={14} /> Reset Internal Config
                  </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
};