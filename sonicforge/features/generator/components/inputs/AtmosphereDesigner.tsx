
import React, { useState, useEffect, memo } from 'react';
import { Wind, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { ATMOSPHERIC_TEXTURES, SFX_CATEGORIES } from '../../data/sfxDatabase';
import { sfx } from '../../../../lib/audio';
import { BuilderTranslation, DesignersTranslation } from '../../../../types';

interface AtmosphereDesignerProps {
  value: string;
  onChange: (value: string) => void;
  isPyriteMode: boolean;
  t?: BuilderTranslation;
}

const DEFAULT_DESIGNER_TRANSLATION: DesignersTranslation = {
    titles: {
        vocal: "Vocal Style Designer",
        instrument: "Instrument Designer",
        atmosphere: "Atmosphere & FX Designer"
    },
    labels: {
        voiceType: "Voice Type",
        texture: "Texture & Quality",
        delivery: "Delivery Style",
        regional: "Regional & Cultural",
        arrangement: "Arrangement & Layers",
        energy: "Energy Level",
        emotion: "Emotional Tone",
        primaryInst: "Primary Instruments",
        modifiers: "Modifiers",
        lessCommon: "Show Less Common",
        textures: "Atmospheric Textures",
        sfx: "Sound Effects",
        preview: "Live Preview",
        suggestions: "Suggestions for",
        loadPreset: "Load Preset...",
        polishedMix: "Polished Mix",
        showLess: "Show Less"
    },
    placeholders: {
        selectOptions: "Select options to build style..."
    }
};

const AtmosphereDesigner: React.FC<AtmosphereDesignerProps> = memo(({ value, onChange, isPyriteMode, t }) => {
  const [textures, setTextures] = useState<string[]>([]);
  const [effects, setEffects] = useState<string[]>([]);

  // Fallback translation
  const td: DesignersTranslation = t?.designers || DEFAULT_DESIGNER_TRANSLATION;

  // Parse incoming string value to set internal state
  useEffect(() => {
    const parts = value.split(',').map(s => s.trim().toLowerCase());
    
    setTextures(ATMOSPHERIC_TEXTURES.filter(t => parts.includes(t.toLowerCase())));
    
    const allSfx = Object.values(SFX_CATEGORIES).flat();
    setEffects(allSfx.filter(e => parts.includes(e.toLowerCase())));

  }, [value]);

  // Build string from internal state and call onChange
  useEffect(() => {
    const buildString = () => {
      const parts = new Set([...textures, ...effects]);
      onChange(Array.from(parts).join(', '));
    };
    buildString();
  }, [textures, effects, onChange]);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    sfx.play('click');
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  
  const panelBg = isPyriteMode ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-teal-900/10 border-teal-500/20';
  const accentText = isPyriteMode ? 'text-indigo-300' : 'text-teal-300';
  const activeChipClass = isPyriteMode ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-teal-500/20 border-teal-500/50';
  const inactiveChipClass = 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700';

  return (
    <div className={cn("p-4 rounded-xl border", panelBg)}>
      <div className="flex items-center mb-4 pb-2 border-b border-white/5">
        <Wind className={cn("w-4 h-4 mr-2", accentText)} />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{td.titles.atmosphere}</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.textures}</label>
          <div className="flex flex-wrap gap-2">
            {ATMOSPHERIC_TEXTURES.map(t => (
              <button key={t} onClick={() => handleToggle(setTextures, t)} className={cn('px-2 py-1 text-[10px] font-bold rounded-full border transition-colors', textures.includes(t) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <details className="group pt-2">
            <summary className="list-none cursor-pointer text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{td.labels.sfx}</summary>
            <div className="pt-3 space-y-3">
                {Object.entries(SFX_CATEGORIES).map(([category, sfxList]) => (
                    <div key={category}>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{category}</label>
                        <div className="flex flex-wrap gap-2">
                            {sfxList.map(sfx => (
                                <button key={sfx} onClick={() => handleToggle(setEffects, sfx)} className={cn('px-2 py-1 text-[10px] font-mono rounded-full border transition-colors', effects.includes(sfx) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                                    {sfx}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </details>

        <div className="pt-3 border-t border-white/5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.preview}</label>
            <div className="p-2 rounded-lg bg-black/40 text-xs font-mono text-zinc-300 min-h-[24px]">
                {value}
            </div>
        </div>
      </div>
    </div>
  );
});

export default AtmosphereDesigner;
