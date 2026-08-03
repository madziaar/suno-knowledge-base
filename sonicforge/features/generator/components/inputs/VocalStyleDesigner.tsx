
import React, { useState, useEffect, useMemo, memo } from 'react';
import { MicVocal, Sparkles, MapPin, Layers, User, Activity, Heart, Bookmark } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { 
  GENDER_TYPES, 
  VOCAL_QUALITIES, 
  VOCAL_DELIVERIES, 
  VOCAL_REGIONS, 
  VOCAL_LAYERS,
  VOCAL_PRESETS,
  suggestVocalsForGenre 
} from '../../data/vocalDatabase';
import { sfx } from '../../../../lib/audio';
import CustomSelect, { SelectOption } from '../../../../components/shared/CustomSelect';
import { useSettings } from '../../../../contexts/SettingsContext';
import { BuilderTranslation, DesignersTranslation } from '../../../../types';

interface VocalStyleDesignerProps {
  value: string;
  onChange: (value: string) => void;
  genre: string;
  isPyriteMode: boolean;
  t?: BuilderTranslation;
}

// Default translation fallback to avoid any casting
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

const VocalStyleDesigner: React.FC<VocalStyleDesignerProps> = memo(({ value, onChange, genre, isPyriteMode, t }) => {
  // --- STATE ---
  const [gender, setGender] = useState<string>('');
  const [qualities, setQualities] = useState<string[]>([]);
  const [deliveries, setDeliveries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [layers, setLayers] = useState<string[]>([]);
  
  const [energy, setEnergy] = useState(50); // 0-100 slider
  const [emotion, setEmotion] = useState(50); // 0-100 slider
  
  const { lang } = useSettings();
  
  // Safe fallback if t is not passed
  const td: DesignersTranslation = t?.designers || DEFAULT_DESIGNER_TRANSLATION;

  // --- PARSING LOGIC (Reverse Engineer String to State) ---
  useEffect(() => {
    const parts = value.split(',').map(s => s.trim().toLowerCase());
    
    const foundGender = GENDER_TYPES.find(g => parts.includes(g.toLowerCase()));
    setGender(foundGender || '');
    
    setQualities(VOCAL_QUALITIES.filter(q => parts.includes(q.toLowerCase())));
    setDeliveries(VOCAL_DELIVERIES.filter(d => parts.includes(d.toLowerCase())));
    setRegions(VOCAL_REGIONS.filter(r => parts.includes(r.toLowerCase())));
    setLayers(VOCAL_LAYERS.filter(l => parts.includes(l.toLowerCase())));
    
    // Heuristic for sliders if not manually set recently (ignoring complex logic for simplicity)
    if (parts.some(p => p.includes('aggressive') || p.includes('powerful'))) setEnergy(80);
    else if (parts.some(p => p.includes('soft') || p.includes('gentle') || p.includes('whisper'))) setEnergy(20);
    
    if (parts.some(p => p.includes('sad') || p.includes('melancholic'))) setEmotion(20);
    else if (parts.some(p => p.includes('happy') || p.includes('uplifting') || p.includes('joyful'))) setEmotion(80);

  }, [value]);

  // --- BUILD LOGIC (State to String) ---
  const handleStateChange = (
    newGender: string, 
    newQualities: string[], 
    newDeliveries: string[], 
    newRegions: string[],
    newLayers: string[],
    newEnergy: number,
    newEmotion: number
  ) => {
      const parts = new Set<string>();
      
      if (newGender) parts.add(newGender);
      newQualities.forEach(q => parts.add(q));
      newDeliveries.forEach(d => parts.add(d));
      newRegions.forEach(r => parts.add(r));
      newLayers.forEach(l => parts.add(l));
      
      // Add slider descriptors only if they deviate from center
      if (newEnergy > 75) parts.add('Powerful Delivery');
      else if (newEnergy < 25) parts.add('Gentle Delivery');
      
      if (newEmotion > 75) parts.add('Uplifting Tone');
      else if (newEmotion < 25) parts.add('Melancholic Tone');

      onChange(Array.from(parts).join(', '));
  };

  // --- HANDLERS ---
  const updateGender = (val: string) => {
      setGender(val);
      handleStateChange(val, qualities, deliveries, regions, layers, energy, emotion);
  };

  const toggleItem = (list: string[], setList: any, item: string) => {
      sfx.play('click');
      const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
      setList(newList);
      // Determine which list we are updating to pass correct args
      // This is a bit verbose but safe
      if (list === qualities) handleStateChange(gender, newList, deliveries, regions, layers, energy, emotion);
      else if (list === deliveries) handleStateChange(gender, qualities, newList, regions, layers, energy, emotion);
      else if (list === regions) handleStateChange(gender, qualities, deliveries, newList, layers, energy, emotion);
      else if (list === layers) handleStateChange(gender, qualities, deliveries, regions, newList, energy, emotion);
  };

  const updateEnergy = (val: number) => {
      setEnergy(val);
      handleStateChange(gender, qualities, deliveries, regions, layers, val, emotion);
  };

  const updateEmotion = (val: number) => {
      setEmotion(val);
      handleStateChange(gender, qualities, deliveries, regions, layers, energy, val);
  };

  const handleApplyPreset = (presetNameEn: string) => {
      // Find preset by English name (which is used as ID here)
      const preset = VOCAL_PRESETS.find(p => p.name.en === presetNameEn);
      if (preset) {
          sfx.play('success');
          // We just set the string directly, the useEffect parser will handle the state update
          onChange(preset.tags.join(', '));
      }
  };

  const handleApplyRecommendation = (rec: string) => {
    sfx.play('success');
    // Append to existing
    const current = value ? value.split(', ').filter(Boolean) : [];
    if (!current.includes(rec)) {
        onChange([...current, rec].join(', '));
    }
  };

  const recommendations = useMemo(() => suggestVocalsForGenre(genre), [genre]);

  // --- STYLES ---
  const panelBg = isPyriteMode ? 'bg-pink-900/10 border-pink-500/20' : 'bg-green-900/10 border-green-500/20';
  const accentText = isPyriteMode ? 'text-pink-300' : 'text-green-300';
  const activeChipClass = isPyriteMode ? 'bg-pink-500/20 border-pink-500/50 text-pink-100' : 'bg-green-500/20 border-green-500/50 text-green-800';
  const inactiveChipClass = 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400';
  const labelClass = "text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5";

  // Prep Preset Options - Use localized label, English value as key
  const presetOptions: SelectOption[] = VOCAL_PRESETS.map(p => ({ 
      label: lang === 'pl' ? p.name.pl : p.name.en, 
      value: p.name.en // Keep English name as ID for logic
  }));

  return (
    <div className={cn("p-4 rounded-xl border space-y-6", panelBg)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center">
            <MicVocal className={cn("w-4 h-4 mr-2", accentText)} />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{td.titles.vocal}</h3>
        </div>
        <div className="w-40">
            <CustomSelect 
                value="" 
                onChange={handleApplyPreset} 
                options={presetOptions} 
                placeholder={td.labels.loadPreset} 
                variant={isPyriteMode ? 'pyrite' : 'default'}
                icon={<Bookmark className="w-3 h-3" />}
            />
        </div>
      </div>
      
      {/* Core Characteristics */}
      <div className="space-y-4">
        {/* Gender */}
        <div>
          <label className={labelClass}><User className="w-3 h-3" /> {td.labels.voiceType}</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_TYPES.slice(0, 7).map(g => (
              <button key={g} onClick={() => updateGender(g)} className={cn('px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-colors', gender === g ? activeChipClass : inactiveChipClass)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Qualities & Texture */}
        <div>
          <label className={labelClass}><Activity className="w-3 h-3" /> {td.labels.texture}</label>
          <div className="flex flex-wrap gap-1.5">
            {VOCAL_QUALITIES.map(q => (
              <button key={q} onClick={() => toggleItem(qualities, setQualities, q)} className={cn('px-2 py-1 text-[10px] font-medium rounded-full border transition-colors', qualities.includes(q) ? activeChipClass : inactiveChipClass)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div>
          <label className={labelClass}><MicVocal className="w-3 h-3" /> {td.labels.delivery}</label>
          <div className="flex flex-wrap gap-1.5">
            {VOCAL_DELIVERIES.map(d => (
              <button key={d} onClick={() => toggleItem(deliveries, setDeliveries, d)} className={cn('px-2 py-1 text-[10px] font-medium rounded-full border transition-colors', deliveries.includes(d) ? activeChipClass : inactiveChipClass)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
          {/* Region & Culture */}
          <div>
              <label className={labelClass}><MapPin className="w-3 h-3" /> {td.labels.regional}</label>
              <div className="flex flex-wrap gap-1.5">
                {VOCAL_REGIONS.map(r => (
                  <button key={r} onClick={() => toggleItem(regions, setRegions, r)} className={cn('px-2 py-1 text-[10px] font-medium rounded-md border transition-colors', regions.includes(r) ? activeChipClass : inactiveChipClass)}>
                    {r}
                  </button>
                ))}
              </div>
          </div>

          {/* Arrangement */}
          <div>
              <label className={labelClass}><Layers className="w-3 h-3" /> {td.labels.arrangement}</label>
              <div className="flex flex-wrap gap-1.5">
                {VOCAL_LAYERS.map(l => (
                  <button key={l} onClick={() => toggleItem(layers, setLayers, l)} className={cn('px-2 py-1 text-[10px] font-medium rounded-md border transition-colors', layers.includes(l) ? activeChipClass : inactiveChipClass)}>
                    {l}
                  </button>
                ))}
              </div>
          </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/5">
            <div>
                <label className={labelClass}><Activity className="w-3 h-3" /> {td.labels.energy}</label>
                <input type="range" min="0" max="100" value={energy} onChange={e => updateEnergy(parseInt(e.target.value))} className={cn("w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer mt-2", isPyriteMode ? 'accent-pink-500' : 'accent-green-500')} />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono"><span>Soft</span><span>Powerful</span></div>
            </div>
            <div>
                <label className={labelClass}><Heart className="w-3 h-3" /> {td.labels.emotion}</label>
                <input type="range" min="0" max="100" value={emotion} onChange={e => updateEmotion(parseInt(e.target.value))} className={cn("w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer mt-2", isPyriteMode ? 'accent-pink-500' : 'accent-green-500')} />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono"><span>Melancholic</span><span>Uplifting</span></div>
            </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            {td.labels.suggestions} {genre}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {recommendations.map((rec, i) => (
              <button key={i} onClick={() => handleApplyRecommendation(rec)} className={cn('px-2 py-1 text-[10px] font-mono rounded border transition-colors opacity-70 hover:opacity-100', inactiveChipClass)}>
                + {rec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="pt-2">
          <div className="p-3 rounded-lg bg-black/40 text-xs font-mono text-zinc-300 min-h-[36px] flex items-center border border-white/5">
              {value || <span className="text-zinc-600 italic">{td.placeholders.selectOptions}</span>}
          </div>
      </div>
    </div>
  );
});

export default VocalStyleDesigner;
