
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Music, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { PRIMARY_INSTRUMENTS, INSTRUMENT_MODIFIERS, LESS_COMMON_INSTRUMENTS } from '../../data/instrumentDatabase';
import { GENRE_DATABASE } from '../../data/genreDatabase';
import { sfx } from '../../../../lib/audio';
import { BuilderTranslation, DesignersTranslation } from '../../../../types';
import Tooltip from '../../../../components/Tooltip';
import { Fader } from '../../../../components/ui/Fader';

interface InstrumentDesignerProps {
  value: string;
  onChange: (value: string) => void;
  genre: string;
  isPyriteMode: boolean;
  t?: BuilderTranslation;
}

// Fix: Add missing properties to DEFAULT_DESIGNER_TRANSLATION
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
        showLess: "Show Less",
        vocalSyncActive: "Neural Vocalist Sync Active",
        vocalSyncPyrite: "My signature style is now your foundation, Darling.",
        hintLabel: "Neural Assistant Hints",
        hintLabelPyrite: "Neural Persona Hints",
        hintMsg: "Add technical tags for mix clarity.",
        hintMsgPyrite: "I'd suggest dropping a heavy distortion tag here, Darling.",
        pyriteVocalMessage: "My signature style is now your foundation, Darling. Let's mix your little ideas into my glorious chaos."
    },
    placeholders: {
        selectOptions: "Select options to build style..."
    }
};

const InstrumentDesigner: React.FC<InstrumentDesignerProps> = memo(({ value, onChange, genre, isPyriteMode, t }) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [drive, setDrive] = useState(50);
  const [polish, setPolish] = useState(30);

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

    // Fix: Using lowercase strictly for matching as per instructions
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
      
      // Add standard instrument selections
      for (const inst in selected) {
        if (selected[inst].length > 0) {
          selected[inst].forEach(mod => parts.push(`${mod} ${inst}`));
        } else {
          parts.push(inst);
        }
      }
      
      // Add Fader-driven technical tags
      if (drive > 80) parts.push('Overdriven');
      else if (drive < 20) parts.push('Clean');
      
      if (polish > 70) parts.push('Mastered', 'Crystal Clear');
      else if (polish < 20) parts.push('Raw Production');

      onChange(Array.from(new Set(parts)).join(', '));
    };
    buildString();
  }, [selected, drive, polish, onChange]);

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
      setPolish(90); // Automate fader for visual feedback
      const polishTags = ['Reverb', 'EQ', 'Compression', 'Wide Stereo'];
      const current = value ? value.split(', ').filter(Boolean) : [];
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
            <Tooltip content={t?.tooltips.instrumentStyle || ""} />
        </div>
        <button 
            onClick={handleAddMixPolish}
            className={cn("px-2 py-1 text-[10px] font-bold rounded border transition-colors flex items-center gap-1", isPyriteMode ? "bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30" : "bg-orange-600/20 text-orange-300 border-orange-500/30 hover:bg-orange-600/30")}
        >
            <Sparkles className="w-3 h-3" />
            {td.labels.polishedMix}
        </button>
      </div>
      
      <div className="flex gap-6">
          <div className="flex gap-4 px-2">
              <Fader label="Drv" value={drive} onChange={setDrive} isPyrite={isPyriteMode} />
              <Fader label="Pol" value={polish} onChange={setPolish} isPyrite={isPyriteMode} />
          </div>

          <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.primaryInst}</label>
                <div className="flex flex-wrap gap-2">
                  {PRIMARY_INSTRUMENTS.map(inst => (
                    <button key={inst} onClick={() => handleTogglePrimary(inst)} className={cn('px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors', selected[inst] ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(selected).length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  {Object.keys(selected).map(inst => {
                    const mods = INSTRUMENT_MODIFIERS[inst];
                    if (!mods) return null;
                    return (
                      <div key={inst}>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">{inst}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {mods.slice(0, 5).map(mod => (
                            <button key={mod} onClick={() => handleToggleModifier(inst, mod)} className={cn('px-1.5 py-0.5 text-[9px] font-medium rounded-md border transition-colors', selected[inst].includes(mod) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-500')}>
                              {mod}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
      </div>

      <div className="pt-3 border-t border-white/5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.preview}</label>
          <div className="p-2 rounded-lg bg-black/40 text-[10px] font-mono text-zinc-300 min-h-[24px]">
              {value || "Selecting hardware..."}
          </div>
      </div>
    </div>
  );
});

export default InstrumentDesigner;
