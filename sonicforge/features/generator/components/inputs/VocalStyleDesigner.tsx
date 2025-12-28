
import React, { useState, useEffect, memo } from 'react';
import { MicVocal, Zap, Ghost, Flame, ShieldCheck, Waves, Globe, User } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { 
  GENDER_TYPES, 
  VOCAL_QUALITIES, 
  VOCAL_DELIVERIES,
  VOCAL_REGIONS,
  VOCAL_EMOTIONS
} from '../../data/vocalDatabase';
import { sfx } from '../../../../lib/audio';
import { BuilderTranslation, DesignersTranslation } from '../../../../types';
import Tooltip from '../../../../components/Tooltip';
import { Fader } from '../../../../components/ui/Fader';

interface VocalStyleDesignerProps {
  value: string;
  onChange: (value: string) => void;
  genre: string;
  isPyriteMode: boolean;
  t?: BuilderTranslation;
}

// Default translation fallback to prevent crashes if t is missing
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

const VocalStyleDesigner: React.FC<VocalStyleDesignerProps> = memo(({ value, onChange, genre, isPyriteMode, t }) => {
  const [gender, setGender] = useState<string[]>([]);
  const [quality, setQuality] = useState<string[]>([]);
  const [delivery, setDelivery] = useState<string[]>([]);
  const [regional, setRegional] = useState<string[]>([]);
  
  const [energy, setEnergy] = useState(50);
  const [emotion, setEmotion] = useState(50);

  // Use provided translation or fallback
  const td: DesignersTranslation = t?.designers || DEFAULT_DESIGNER_TRANSLATION;

  // Parse incoming string value to set internal state
  useEffect(() => {
    if (!value) return;
    const parts = value.split(',').map(s => s.trim());
    
    setGender(GENDER_TYPES.filter(g => parts.some(p => p.toLowerCase().includes(g.toLowerCase()))));
    setQuality(VOCAL_QUALITIES.filter(q => parts.some(p => p.toLowerCase().includes(q.toLowerCase()))));
    setDelivery(VOCAL_DELIVERIES.filter(d => parts.some(p => p.toLowerCase().includes(d.toLowerCase()))));
    setRegional(VOCAL_REGIONS.filter(r => parts.some(p => p.toLowerCase().includes(r.toLowerCase()))));
  }, [value]);

  // Build string from internal state
  useEffect(() => {
    const buildString = () => {
      const parts = new Set([...gender, ...quality, ...delivery, ...regional]);
      
      // Fader Logic
      if (energy > 80) parts.add('High Energy');
      else if (energy < 20) parts.add('Laid-back');
      
      if (emotion > 80) parts.add('Emotional');
      else if (emotion < 20) parts.add('Deadpan');

      // Manual check to avoid infinite loop if string implies these tags but user didn't select them
      const currentString = Array.from(parts).join(', ');
      // Only call onChange if the constructed string is substantially different/new
      // (Simple check to avoid loop, though Set helps)
      if (currentString !== value) {
          onChange(currentString);
      }
    };
    // Debounce slightly or just run
    const timer = setTimeout(buildString, 100);
    return () => clearTimeout(timer);
  }, [gender, quality, delivery, regional, energy, emotion, onChange, value]);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    sfx.play('click');
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const panelBg = isPyriteMode ? 'bg-pink-900/10 border-pink-500/20' : 'bg-red-900/10 border-red-500/20';
  const accentText = isPyriteMode ? 'text-pink-300' : 'text-red-300';
  const activeChipClass = isPyriteMode ? 'bg-pink-500/20 border-pink-500/50' : 'bg-red-500/20 border-red-500/50';
  const inactiveChipClass = 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700';

  return (
    <div className={cn("p-4 rounded-xl border", panelBg)}>
      <div className="flex items-center mb-4 pb-2 border-b border-white/5">
        <MicVocal className={cn("w-4 h-4 mr-2", accentText)} />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{td.titles.vocal}</h3>
        <Tooltip content={t?.tooltips.vocalStyle || ""} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
          {/* Faders */}
          <div className="flex gap-4 px-2 justify-center md:justify-start">
              <Fader label={td.labels.energy} value={energy} onChange={setEnergy} isPyrite={isPyriteMode} className="w-12" />
              <Fader label={td.labels.emotion} value={emotion} onChange={setEmotion} isPyrite={isPyriteMode} className="w-12" />
          </div>

          {/* Tags Grid */}
          <div className="flex-1 space-y-4">
              {/* Gender / Type */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {td.labels.voiceType}
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_TYPES.map(t => (
                    <button key={t} onClick={() => handleToggle(setGender, t)} className={cn('px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors', gender.includes(t) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-400')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Texture */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Waves className="w-3 h-3" /> {td.labels.texture}
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOCAL_QUALITIES.slice(0, 12).map(q => (
                    <button key={q} onClick={() => handleToggle(setQuality, q)} className={cn('px-2 py-1 text-[10px] font-medium rounded-full border transition-colors', quality.includes(q) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-500')}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> {td.labels.delivery}
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOCAL_DELIVERIES.slice(0, 10).map(d => (
                    <button key={d} onClick={() => handleToggle(setDelivery, d)} className={cn('px-2 py-1 text-[10px] font-medium rounded-full border transition-colors', delivery.includes(d) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-500')}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regional */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> {td.labels.regional}
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOCAL_REGIONS.slice(0, 6).map(r => (
                    <button key={r} onClick={() => handleToggle(setRegional, r)} className={cn('px-2 py-1 text-[10px] font-medium rounded-full border transition-colors', regional.includes(r) ? activeChipClass + ' ' + accentText : inactiveChipClass + ' text-zinc-500')}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
          </div>
      </div>

      <div className="pt-3 mt-4 border-t border-white/5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">{td.labels.preview}</label>
          <div className="p-2 rounded-lg bg-black/40 text-[10px] font-mono text-zinc-300 min-h-[24px]">
              {value || "Designing vocal profile..."}
          </div>
      </div>
    </div>
  );
});

export default VocalStyleDesigner;
