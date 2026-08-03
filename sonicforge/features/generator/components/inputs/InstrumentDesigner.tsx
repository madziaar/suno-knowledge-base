
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Music, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { PRIMARY_INSTRUMENTS, INSTRUMENT_MODIFIERS, LESS_COMMON_INSTRUMENTS } from '../../data/instrumentDatabase';
import { GENRE_DATABASE } from '../../data/genreDatabase';
import { sfx } from '../../../../lib/audio';
import { BuilderTranslation, DesignersTranslation } from '../../../../types';

interface InstrumentDesignerProps {
  value: string;
  onChange: (value: string) => void;
  genre: string;
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

const InstrumentDesigner: React.FC<InstrumentDesignerProps> = memo(({ value, onChange, genre, isPyriteMode, t }) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  // Fallback translation
  const td: DesignersTranslation = t?.designers || DEFAULT_DESIGNER_TRANSLATION;

  // Parse incoming string value to set internal state
  useEffect(() => {
    const newSelected: Record<string, string[]> = {};
    const parts = value.split(',').map(s => s.trim());
    
    PRIMARY_INSTRUMENTS.forEach(inst => {
      const modifiers = parts.filter(p => p.toLowerCase().includes(inst.toLowerCase()))
                             .map(p => p.replace(new RegExp(inst, 'i'), '').trim())
                             .filter(Boolean);
      if (modifiers.length > 0) {
        newSelected[inst] = modifiers;
      }
    });

    LESS_COMMON_INSTRUMENTS.forEach(inst => {
        if (parts.some(p => p.toLowerCase() === inst.toLowerCase())) {
            newSelected[inst] = [];
        }
    });

    setSelected(newSelected);
  }, [value]);

  // Build string from internal state and call onChange
  useEffect(() => {
    const buildString = () => {
      const parts: string[] = [];
      for (const inst in selected) {
        if (selected[inst].length > 0) {
          selected[inst].forEach(mod => parts.push(`${mod} ${inst}`));
        } else {
          parts.push(inst);
        }
      }
      onChange(parts.join(', '));
    };
    buildString();
  }, [selected, onChange]);

  const handleTogglePrimary = (instrument: string) => {
    sfx.play('click');
    setSelected(prev => {
      const newSelected = { ...prev };
      if (newSelected[instrument]) {
        delete newSelected[instrument];
      } else {
        newSelected[instrument] = [];
      }
      return newSelected;
    });
  };

  const handleToggleModifier = (instrument: string, modifier: string) => {
    sfx.play('light');
    setSelected(prev => {
      const newSelected = { ...prev };
      if (!newSelected[instrument]) return prev;

      const mods = newSelected[instrument];
      if (mods.includes(modifier)) {
        newSelected[instrument] = mods.filter(m => m !== modifier);
      } else {
        newSelected[instrument] = [...mods, modifier];
      }
      return newSelected;
    });
  };

  const handleAddMixPolish = () => {
      sfx.play('success');
      const polishTags = ['Reverb', 'EQ', 'Compression', 'Wide Stereo'];
      const current = value ? value.split(', ').filter(Boolean) : [];
      
      // Add polish tags if not present
      const toAdd = polishTags.filter(tag => !current.some(c => c.toLowerCase().includes(tag.toLowerCase())));
      
      if (toAdd.length > 0) {
          onChange([...current, ...toAdd].join(', '));
      }
  };

  const recommendations = useMemo(() => {
    if (!genre) return [];
    const genreDef = GENRE_DATABASE.find(g => g.name.toLowerCase() === genre.toLowerCase());
    return genreDef ? genreDef.instruments : [];
  }, [genre]);

  const panelBg = isPyriteMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-orange-900/10 border-orange-500/20';
  const accentText = isPyriteMode ? 'text-blue-300' : 'text-orange-300';
  const activeChipClass = isPyriteMode ? 'bg-blue-500/20 border-blue-500/50' : 'bg-orange-500/20 border-orange-500/50';
  const inactiveChipClass = 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700';

  return (
    <div className={cn("p-4 rounded-xl border", panelBg)}>
      <div className="flex items-center mb-4 pb-2 border-b border-white/5 justify-between">
        <div className="flex items-center">
            <Music className={cn("w-4 h-4 mr-2", accentText)} />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{td.titles.instrument}</h3>
        </div>
        <button 
            onClick={handleAddMixPolish}
            className={cn("px-2 py-1 text-[10px] font-bold rounded border transition-colors flex items-center gap-1", isPyriteMode ? "bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30" : "bg-orange-600/20 text-orange-300 border-orange-500/30 hover:bg-orange-600/30")}
            title="Add Reverb, EQ, Compression for polish"
        >
            <Sparkles className="w-3 h-3" />
            {td.labels.polishedMix}
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.primaryInst}</label>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_INSTRUMENTS.map(inst => (
              <button key={inst} onClick={() => handleTogglePrimary(inst)} className={cn('px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors', selected[inst] ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                {inst}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(selected).length > 0 && Object.keys(selected).some(inst => INSTRUMENT_MODIFIERS[inst]) && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            {Object.keys(selected).map(inst => {
              const mods = INSTRUMENT_MODIFIERS[inst];
              if (!mods) return null;
              return (
                <div key={inst}>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{inst} {td.labels.modifiers}</label>
                  <div className="flex flex-wrap gap-2">
                    {mods.map(mod => (
                      <button key={mod} onClick={() => handleToggleModifier(inst, mod)} className={cn('px-2 py-1 text-[10px] font-bold rounded-full border transition-colors', selected[inst].includes(mod) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <details className="group pt-2">
            <summary className="list-none cursor-pointer text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{td.labels.lessCommon}</summary>
            <div className="pt-3 flex flex-wrap gap-2">
                {LESS_COMMON_INSTRUMENTS.map(inst => (
                    <button key={inst} onClick={() => handleTogglePrimary(inst)} className={cn('px-2 py-1 text-[10px] font-bold rounded-full border transition-colors', selected[inst] ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                        {inst}
                    </button>
                ))}
            </div>
        </details>
        
        {recommendations.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block flex items-center">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {td.labels.suggestions} {genre}
            </label>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((rec, i) => (
                <button key={i} onClick={() => handleTogglePrimary(rec)} className={cn('px-2 py-1 text-[10px] font-mono rounded border transition-colors', inactiveChipClass, 'text-zinc-400')}>
                  {rec}
                </button>
              ))}
            </div>
          </div>
        )}

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

export default InstrumentDesigner;
