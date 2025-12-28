
import React, { useState, useMemo, useCallback, memo } from 'react';
import { Plus, X, ArrowUp, ArrowDown, AlertTriangle, ChevronDown, ChevronRight, Check, Copy, GripVertical, Eraser, Sparkles, RefreshCw, Loader2, Activity, ShieldCheck } from 'lucide-react';
import { SongSection, BuilderTranslation } from '../../../types';
import { SECTION_TYPES, MODIFIER_CATEGORIES } from '../data/expertOptions';
import GlassPanel from '../../../components/shared/GlassPanel';
import SuggestionInput from '../../../components/shared/SuggestionInput';
import { sfx } from '../../../lib/audio';
import { cn } from '../../../lib/utils';
import { detectStructure } from '../../../services/ai/tools';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { useSettingsState } from '../../../contexts/SettingsContext';
import { translations } from '../../../translations';

// --- VISUALIZATION SUB-COMPONENT ---
const EnergyGraph = memo(({ sections, isPyriteMode }: { sections: SongSection[], isPyriteMode: boolean }) => {
    const getEnergy = (type: string, mods: string[]) => {
        const t = type.toLowerCase();
        const m = mods.join(' ').toLowerCase();
        let base = 50; // Verse default
        
        if (t.includes('intro') || t.includes('outro')) base = 30;
        if (t.includes('chorus') || t.includes('drop')) base = 90;
        if (t.includes('build') || t.includes('pre')) base = 70;
        if (t.includes('bridge')) base = 60;
        if (t.includes('breakdown') || t.includes('silence')) base = 20;
        if (t.includes('solo')) base = 85;

        if (m.includes('high energy') || m.includes('heavy') || m.includes('explosive')) base += 10;
        if (m.includes('soft') || m.includes('low') || m.includes('ambient')) base -= 10;

        return Math.min(100, Math.max(10, base));
    };

    return (
        <div className="h-16 w-full flex items-end gap-1 px-1 mb-4 opacity-80 pointer-events-none">
            {sections.map((s, i) => {
                const energy = getEnergy(s.type, s.modifiers);
                const height = `${energy}%`;
                const isHigh = energy > 80;
                
                return (
                    <motion.div
                        key={s.id}
                        layoutId={`bar-${s.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height, opacity: 1 }}
                        className={cn(
                            "flex-1 rounded-t-sm min-w-[4px] relative group transition-colors duration-500",
                            isPyriteMode 
                                ? (isHigh ? "bg-pink-500 shadow-[0_0_10px_#ec4899]" : "bg-purple-500/40")
                                : (isHigh ? "bg-yellow-500 shadow-[0_0_8px_#eab308]" : "bg-blue-500/40")
                        )}
                    >
                        <div className="absolute bottom-0 w-full h-1 bg-white/20" />
                    </motion.div>
                );
            })}
            {sections.length === 0 && (
                <div className="w-full h-full flex items-center justify-center border-b border-dashed border-zinc-700">
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Timeline Empty</span>
                </div>
            )}
        </div>
    );
});

// --- SUB-COMPONENT: Individual Section Item (Memoized) ---
interface SectionItemProps {
  section: SongSection;
  index: number;
  total: number;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onUpdateType: (id: string, type: string) => void;
  onToggleModifier: (id: string, mod: string) => void;
  onDuplicate: (section: SongSection) => void;
  onRemove: (id: string) => void;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const StructureSectionItem = React.memo<SectionItemProps>(({
  section, index, total, isExpanded,
  onExpand, onUpdateType, onToggleModifier, onDuplicate, onRemove,
  isPyriteMode,
  t
}) => {
  const dragControls = useDragControls();
  
  // Defensive check
  const modifiers = Array.isArray(section?.modifiers) ? section.modifiers : [];
  const type = section?.type || 'Unknown';
  
  const isInstrumental = modifiers.includes('Instrumental') || 
                         type === 'Instrumental' || 
                         (type === 'Intro' && modifiers.includes('Instrumental'));
  
  const previewTag = `[${type}${modifiers.length > 0 ? ' | ' + modifiers.join(' | ') : ''}]`;
  
  const checkboxColor = isPyriteMode ? 'bg-purple-600 border-purple-500' : 'bg-blue-600 border-blue-500';
  const categoryBorder = isPyriteMode ? 'border-purple-500/30 text-purple-300' : 'border-blue-500/30 text-blue-300';

  if (!section) return null;

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      className="relative mb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}
    >
      <GlassPanel 
        variant={isPyriteMode ? 'pyrite' : 'default'}
        className={cn(
            "p-0 transition-all relative group overflow-visible focus-within:ring-1 focus-within:ring-white/20",
            isInstrumental ? (isPyriteMode ? 'border-pink-500/50' : 'border-cyan-500/50') : ''
        )}
      >
        {/* Header Row */}
        <div 
          className={`flex items-center gap-2 p-3 ${isInstrumental ? (isPyriteMode ? 'bg-pink-900/10' : 'bg-cyan-900/10') : ''}`}
          role="group"
          aria-label={`Section ${index + 1}: ${type}`}
        >
           {/* Drag Handle */}
           <div 
             className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 flex-shrink-0 p-1 touch-none" 
             onPointerDown={(e) => dragControls.start(e)}
             title="Drag to reorder"
           >
              <GripVertical className="w-4 h-4" />
           </div>

           {/* Index Number */}
           <div className="text-[10px] font-mono opacity-50 w-4 text-center select-none flex-shrink-0">
             {(index + 1).toString().padStart(2, '0')}
           </div>

           {/* Type Selector (Suggestions Input / Dropdown) */}
           <div className="flex-1 min-w-[120px]">
             <SuggestionInput
                value={type}
                onChange={(val) => onUpdateType(section.id, val)}
                options={SECTION_TYPES}
                variant={isPyriteMode ? 'pyrite' : 'default'}
                className={`p-1.5 pl-2 text-xs min-h-[32px] font-bold uppercase ${isPyriteMode ? 'bg-zinc-900/50 border-purple-500/30 focus:border-purple-500' : 'bg-zinc-900 border-zinc-700 focus:border-zinc-500'}`}
                placeholder="Type..."
             />
           </div>

           {/* Expand Toggle */}
           <button 
              onClick={() => onExpand(section.id)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 flex-shrink-0"
              title="Edit Modifiers"
              aria-label={isExpanded ? "Collapse modifiers" : "Expand modifiers"}
           >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
           </button>

           <div className="w-px h-4 bg-zinc-800 mx-1 flex-shrink-0" />

           {/* Actions */}
           <div className="flex items-center gap-1 flex-shrink-0">
             <button type="button" onClick={() => onDuplicate(section)} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors" title="Duplicate" aria-label="Duplicate Section">
               <Copy className="w-3 h-3" />
             </button>
             <button type="button" onClick={() => onRemove(section.id)} className="p-1 hover:bg-red-900/30 text-zinc-500 hover:text-red-500 rounded transition-colors" aria-label="Remove Section">
               <X className="w-3 h-3" />
             </button>
           </div>
        </div>

        {/* Collapsible Content: Checkbox Grid */}
        {isExpanded && (
          <div className="p-4 border-t border-zinc-800/50 bg-black/20 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {MODIFIER_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-2">
                          <h4 className={`text-[10px] uppercase font-bold border-b pb-1 mb-2 ${categoryBorder}`}>
                              {t.expert.categories[category.id as keyof typeof t.expert.categories] || category.name}
                          </h4>
                          <div className="space-y-1.5">
                              {category.options.map(mod => {
                                  const isActive = modifiers.includes(mod);
                                  return (
                                      <label 
                                          key={mod} 
                                          className="flex items-center space-x-2 cursor-pointer group select-none"
                                          onClick={() => sfx.play('click')}
                                      >
                                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                              isActive 
                                              ? `${checkboxColor} text-white`
                                              : 'bg-zinc-900 border-zinc-700 text-transparent group-hover:border-zinc-500'
                                          }`}>
                                              <Check className="w-2.5 h-2.5" />
                                          </div>
                                          <span className={`text-[10px] font-medium transition-colors ${
                                              isActive 
                                              ? 'text-zinc-200' 
                                              : 'text-zinc-500 group-hover:text-zinc-300'
                                          }`}>
                                              {mod}
                                          </span>
                                          <input 
                                              type="checkbox" 
                                              className="hidden"
                                              checked={isActive}
                                              onChange={() => onToggleModifier(section.id, mod)}
                                          />
                                      </label>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}

        {/* Preview Footer */}
        <div className={`px-3 py-1.5 text-[10px] font-mono flex items-center justify-between border-t border-zinc-800/50 ${isInstrumental ? (isPyriteMode ? 'bg-pink-900/20 text-pink-300' : 'bg-cyan-900/20 text-cyan-300') : 'bg-zinc-900/30 text-zinc-500'}`}>
           <span>{previewTag}</span>
           {isInstrumental && (
             <span className="flex items-center text-[9px] font-bold uppercase tracking-wider animate-pulse">
               <AlertTriangle className="w-3 h-3 mr-1" />
               Force Silence
             </span>
           )}
        </div>
      </GlassPanel>
    </Reorder.Item>
  );
});

// --- MAIN COMPONENT ---

interface StructureBuilderProps {
  sections: SongSection[];
  setSections: (value: SongSection[] | ((prev: SongSection[]) => SongSection[])) => void;
  t: BuilderTranslation;
  isPyriteMode?: boolean;
  lyrics?: string;
}

const StructureBuilder: React.FC<StructureBuilderProps> = memo(({ sections, setSections, t, isPyriteMode = false, lyrics = '' }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detectedStructure, setDetectedStructure] = useState<SongSection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { lang } = useSettingsState();

  // --- LYRICS PARSING LOGIC ---
  React.useEffect(() => {
    if (!lyrics) {
      setDetectedStructure([]);
      return;
    }

    const matches = lyrics.matchAll(/\[([^\]]+)\]/g);
    const newSections: SongSection[] = [];

    for (const match of matches) {
      const content = match[1];
      const parts = content.split('|').map(s => s.trim());
      const rawType = parts[0];
      const modifiers = parts.slice(1);
      let type = rawType.replace(/\s*\d+$/, '');
      type = type.charAt(0).toUpperCase() + type.slice(1);

      newSections.push({
        id: crypto.randomUUID(),
        type,
        modifiers
      });
    }

    setDetectedStructure(newSections);
  }, [lyrics]);

  const handleSyncFromLyrics = useCallback(() => {
    if (detectedStructure.length > 0) {
      setSections(detectedStructure);
      sfx.play('success');
    }
  }, [detectedStructure, setSections]);

  const handleAIAnalysis = useCallback(async () => {
    if (!lyrics) return;
    setIsAnalyzing(true);
    sfx.play('click');
    try {
        const result = await detectStructure(lyrics, isPyriteMode);
        if (result.length > 0) {
            setDetectedStructure(result);
            sfx.play('success');
        } else {
            sfx.play('error');
        }
    } catch (e) {
        console.error(e);
        sfx.play('error');
    } finally {
        setIsAnalyzing(false);
    }
  }, [lyrics, isPyriteMode]);

  // --- ACTIONS ---

  const addSection = useCallback((type: string = 'Verse') => {
    sfx.play('click');
    setSections(prev => [...(Array.isArray(prev) ? prev : []), {
      id: crypto.randomUUID(),
      type,
      modifiers: []
    }]);
  }, [setSections]);

  const duplicateSection = useCallback((section: SongSection) => {
    sfx.play('click');
    setSections(prev => {
      if (!Array.isArray(prev)) return [];
      const index = prev.findIndex(s => s.id === section.id);
      if (index === -1) return prev;
      const newSection = { ...section, id: crypto.randomUUID() };
      const newArr = [...prev];
      newArr.splice(index + 1, 0, newSection);
      return newArr;
    });
  }, [setSections]);

  const removeSection = useCallback((id: string) => {
    sfx.play('click');
    setSections(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : []);
  }, [setSections]);
  
  const clearSections = useCallback(() => {
    if (confirm(translations[lang].dialogs.resetStructure)) {
        sfx.play('error');
        setSections([]);
    }
  }, [setSections, lang]);

  const addPowerEnding = useCallback(() => {
      sfx.play('secret');
      setSections(prev => [
          ...(Array.isArray(prev) ? prev : []),
          { id: crypto.randomUUID(), type: 'Instrumental Fade Out', modifiers: [] },
          { id: crypto.randomUUID(), type: 'End', modifiers: [] }
      ]);
  }, [setSections]);

  const updateSectionType = useCallback((id: string, newType: string) => {
    setSections(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, type: newType } : s) : []);
  }, [setSections]);

  const toggleModifier = useCallback((id: string, modifier: string) => {
    setSections(prev => Array.isArray(prev) ? prev.map(s => {
      if (s.id !== id) return s;
      const safeModifiers = s.modifiers || [];
      const hasMod = safeModifiers.includes(modifier);
      return {
        ...s,
        modifiers: hasMod 
          ? safeModifiers.filter(m => m !== modifier)
          : [...safeModifiers, modifier]
      };
    }) : []);
  }, [setSections]);

  const handleExpand = useCallback((id: string) => {
    sfx.play('click');
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // --- SMART SUGGESTIONS LOGIC ---
  const suggestions = useMemo(() => {
    if (!Array.isArray(sections) || sections.length === 0) return ['Intro', 'Verse', 'Chorus'];
    
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return ['Intro', 'Verse', 'Chorus'];

    const lastType = lastSection.type;
    switch (lastType) {
      case 'Intro': return ['Verse', 'Hook', 'Instrumental'];
      case 'Verse': return ['Pre-Chorus', 'Chorus', 'Bridge'];
      case 'Pre-Chorus': return ['Chorus', 'Drop'];
      case 'Chorus': return ['Verse', 'Post-Chorus', 'Bridge', 'Outro'];
      case 'Post-Chorus': return ['Verse', 'Bridge', 'Outro'];
      case 'Bridge': return ['Chorus', 'Solo', 'Outro'];
      case 'Solo': return ['Chorus', 'Verse', 'Outro'];
      case 'Instrumental': return ['Verse', 'Bridge', 'Drop'];
      case 'Drop': return ['Verse', 'Bridge', 'Outro'];
      case 'Build-up': return ['Drop', 'Chorus'];
      case 'Outro': return [];
      default: return ['Verse', 'Chorus'];
    }
  }, [sections]);

  const activeText = isPyriteMode ? 'text-purple-400' : 'text-blue-400';
  const suggestionBtnClass = isPyriteMode 
    ? 'bg-purple-900/30 border-purple-500/30 hover:bg-purple-500/30 text-purple-300'
    : 'bg-blue-900/30 border-blue-500/30 hover:bg-blue-500/30 text-blue-300';

  return (
    <div className="space-y-4">
      {/* Header / Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Activity className={cn("w-4 h-4", activeText)} />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${activeText}`}>
                {t.structure || "Structure Builder"}
                </h3>
            </div>
            
            <div className="flex gap-2">
                {detectedStructure.length === 0 && lyrics.length > 50 && (
                    <button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className={cn(
                            "flex items-center px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                            isPyriteMode 
                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30' 
                                : 'bg-blue-600/20 text-blue-700 border border-blue-500/30 hover:bg-blue-600/30',
                            isAnalyzing && "opacity-50 cursor-not-allowed"
                        )}
                        title={t.expert.detectWithAI}
                    >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                        {isAnalyzing ? (lang === 'pl' ? 'Skanowanie...' : 'Scanning...') : t.expert.detectWithAI}
                    </button>
                )}

                {detectedStructure.length > 0 && (
                    <button
                        onClick={handleSyncFromLyrics}
                        className={cn(
                            "flex items-center px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all animate-pulse",
                            isPyriteMode 
                                ? 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30' 
                                : 'bg-green-600/20 text-green-700 border border-green-500/30 hover:bg-green-600/30'
                        )}
                        title={t.expert.syncFromLyrics}
                    >
                        <RefreshCw className="w-3 h-3 mr-1.5" />
                        {lang === 'pl' ? 'Synchronizuj' : 'Sync'} ({detectedStructure.length})
                    </button>
                )}

                {Array.isArray(sections) && sections.length > 0 && (
                    <button 
                        onClick={clearSections} 
                        className="flex items-center px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900/40 transition-colors"
                        title={t.expert.clearAll}
                    >
                        <Eraser className="w-3 h-3 mr-1.5" />
                        {t.expert.clearAll}
                    </button>
                )}
                
                <button
                type="button"
                onClick={() => addSection('Verse')}
                className={`flex items-center px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                    isPyriteMode 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                }`}
                >
                <Plus className="w-3 h-3 mr-1" />
                {t.expert.addSection}
                </button>
            </div>
        </div>
      </div>

      {/* Pulse Timeline (Energy Graph) */}
      <EnergyGraph sections={sections} isPyriteMode={isPyriteMode} />

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1 pb-4 relative min-h-[100px]">
        {Array.isArray(sections) && sections.length > 0 ? (
            <Reorder.Group axis="y" values={sections} onReorder={setSections}>
                {sections.map((section, index) => (
                    <StructureSectionItem 
                      key={section.id}
                      section={section}
                      index={index}
                      total={sections.length}
                      isExpanded={expandedId === section.id}
                      onExpand={handleExpand}
                      onUpdateType={updateSectionType}
                      onToggleModifier={toggleModifier}
                      onDuplicate={duplicateSection}
                      onRemove={removeSection}
                      isPyriteMode={isPyriteMode}
                      t={t}
                    />
                ))}
            </Reorder.Group>
        ) : (
          <div className="text-center py-8 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg text-xs flex flex-col items-center">
            <span className="mb-2">{t.expert.emptySequence}</span>
            {detectedStructure.length > 0 ? (
                <button 
                    onClick={handleSyncFromLyrics}
                    className="text-green-400 hover:text-green-300 underline font-bold"
                >
                    {t.expert.importFromLyrics.replace('{0}', String(detectedStructure.length))}
                </button>
            ) : (
                <button 
                    onClick={() => addSection('Intro')}
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    {t.expert.startWithIntro}
                </button>
            )}
          </div>
        )}

        {/* Smart Suggestions Row */}
        {suggestions.length > 0 && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 flex flex-wrap gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
              <Sparkles className={`w-3 h-3 ${isPyriteMode ? 'text-purple-500' : 'text-blue-500'} flex-shrink-0`} />
              {suggestions.map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => addSection(sug)}
                  className={`flex-shrink-0 px-2 py-1 text-[10px] uppercase font-bold rounded border transition-all ${suggestionBtnClass}`}
                >
                  + {sug}
                </button>
              ))}
            </div>
            
            <button
                type="button"
                onClick={addPowerEnding}
                className={cn(
                    "flex-shrink-0 px-2 py-1 text-[10px] uppercase font-bold rounded border transition-all flex items-center gap-1",
                    isPyriteMode 
                        ? 'bg-pink-900/30 border-pink-500/30 text-pink-300 hover:bg-pink-500/30' 
                        : 'bg-orange-900/30 border-orange-500/30 text-orange-300 hover:bg-orange-500/30'
                )}
                title="Add [Instrumental Fade Out][End]"
            >
                <ShieldCheck className="w-3 h-3" />
                Power Ending
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default StructureBuilder;
