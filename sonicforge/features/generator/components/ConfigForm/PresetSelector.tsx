
import React, { useMemo, memo, useState, useRef, useEffect, useCallback } from 'react';
import { Bookmark, ChevronDown, Link, Dices, FilePlus, Search, Check, X, AudioWaveform, Music, Save, Trash2, User } from 'lucide-react';
import { presetTemplates } from '../../data/presets';
import { BuilderTranslation, Preset, UserPreset, SongConcept, ExpertInputs } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../../../../lib/keyboard-shortcuts';

interface PresetSelectorProps {
  onPresetChange: (presetId: string) => void;
  onUserPresetLoad: (preset: UserPreset) => void;
  onShare: () => void;
  onRandomize: () => void;
  onClear: () => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  lang: 'en' | 'pl';
  currentInputs: SongConcept;
  currentExpertInputs: ExpertInputs;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = memo(({
  onPresetChange,
  onUserPresetLoad,
  onShare,
  onRandomize,
  onClear,
  t,
  isPyriteMode,
  lang,
  currentInputs,
  currentExpertInputs,
  showToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Local storage for user presets
  const [userPresets, setUserPresets] = useLocalStorage<UserPreset[]>('pyrite_user_presets', []);

  // Close on click outside
  useEffect(() => {
    // FIX: Replaced non-existent wrapperRef with dropdownRef
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSavePreset = useCallback(() => {
      const name = window.prompt("Name your masterpiece:");
      if (!name || !name.trim()) return;
      
      const newPreset: UserPreset = {
          id: `user-${crypto.randomUUID()}`,
          name: name.trim(),
          timestamp: Date.now(),
          inputs: currentInputs,
          expertInputs: currentExpertInputs,
          isExpertMode: true // Assume saving implies expert config matters
      };
      
      setUserPresets(prev => [newPreset, ...prev]);
      showToast("Preset Saved to Stash", 'success');
      sfx.play('success');
  }, [currentInputs, currentExpertInputs, setUserPresets, showToast]);

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
        key: 's',
        ctrlKey: true,
        handler: handleSavePreset,
        allowInInput: true
    }
  ]);

  const handleDeleteUserPreset = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Delete this preset?")) {
          setUserPresets(prev => prev.filter(p => p.id !== id));
          sfx.play('click');
      }
  };

  const getPresetName = (preset: Preset, language: 'en' | 'pl') => {
      if (language === 'pl') return preset.name.pl;
      return preset.name.en;
  };

  const filteredGroups = useMemo(() => {
    const groups: Record<string, (Preset | UserPreset)[]> = {};
    const lowerQuery = searchQuery.toLowerCase();

    // 1. User Presets
    if (userPresets.length > 0) {
        const matchingUserPresets = userPresets.filter(p => 
            p.name.toLowerCase().includes(lowerQuery)
        );
        if (matchingUserPresets.length > 0) {
            groups['My Stash'] = matchingUserPresets;
        }
    }

    // 2. System Presets
    presetTemplates.forEach(preset => {
      const name = getPresetName(preset, lang);
      const match = !searchQuery || 
                    name.toLowerCase().includes(lowerQuery) || 
                    preset.tags?.includes(lowerQuery) ||
                    preset.category?.toLowerCase().includes(lowerQuery);

      if (match) {
        const cat = preset.category || 'Uncategorized';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(preset);
      }
    });
    return groups;
  }, [searchQuery, lang, userPresets]);

  const handleSelect = (item: Preset | UserPreset) => {
    setSelectedPresetId(item.id);
    
    if ('inputs' in item) {
        // User Preset
        onUserPresetLoad(item as UserPreset);
    } else {
        // System Preset
        onPresetChange(item.id);
    }
    
    setIsOpen(false);
    sfx.play('click');
  };

  const selectedName = useMemo(() => {
    // Check User Presets first
    const userPreset = userPresets.find(p => p.id === selectedPresetId);
    if (userPreset) return userPreset.name;

    // Then System
    const p = presetTemplates.find(pr => pr.id === selectedPresetId);
    return p ? getPresetName(p, lang) : '';
  }, [selectedPresetId, lang, userPresets]);

  // Styles
  const borderColor = isPyriteMode ? 'border-purple-500/20' : 'border-white/10';
  const focusRing = isPyriteMode ? 'focus:ring-purple-500/50' : 'focus:ring-yellow-500/50';
  const activeItemBg = isPyriteMode ? 'bg-purple-900/30 text-purple-200' : 'bg-yellow-900/20 text-yellow-200';
  const dropdownBg = isPyriteMode ? 'bg-zinc-950/95 border-purple-500/30 ring-1 ring-purple-500/20' : 'bg-zinc-900/95 border-zinc-700 ring-1 ring-white/10';
  const inputBg = isPyriteMode ? 'bg-zinc-950/50 text-purple-100' : 'bg-zinc-900/50 text-zinc-200';

  return (
    <div className="flex items-end gap-2 relative z-30" ref={dropdownRef}>
      <div className="flex-1">
          <div className="flex items-center mb-1.5">
              <label className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center select-none", isPyriteMode ? 'text-purple-300/80' : 'text-zinc-500')}>
                  <Bookmark className="w-3 h-3 mr-1" />
                  {t?.presetsLabel || "Presets"}
              </label>
          </div>
          
          {/* Custom Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "w-full flex items-center justify-between border rounded-xl p-3 text-xs md:text-sm outline-none transition-all duration-200 hover:border-white/20 focus:ring-1",
                inputBg,
                borderColor,
                focusRing,
                isOpen && (isPyriteMode ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-yellow-500 ring-1 ring-yellow-500/50')
            )}
          >
            <span className={cn("truncate", !selectedName && "text-zinc-500 italic")}>
                {selectedName || (t?.presetsPlaceholder || "Select a template...")}
            </span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 opacity-60", isOpen && "rotate-180 opacity-100")} />
          </button>

          {/* Custom Dropdown */}
          {isOpen && (
            <div className={cn(
                "absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 origin-top max-h-[60vh] flex flex-col z-50",
                dropdownBg
            )}>
                {/* Search Header */}
                <div className="p-2 border-b border-white/5 sticky top-0 bg-inherit z-10 backdrop-blur-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input 
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search presets..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-white outline-none focus:border-white/20 transition-colors"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto custom-scrollbar p-1">
                    {Object.entries(filteredGroups).length > 0 ? (
                        Object.entries(filteredGroups).map(([category, items]) => (
                            <div key={category} className="mb-2 last:mb-0">
                                <div className={cn(
                                    "px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest sticky top-0 bg-inherit/95 backdrop-blur-sm truncate flex items-center justify-center z-10",
                                    category === 'My Stash' ? (isPyriteMode ? "text-purple-400" : "text-yellow-500") : "text-zinc-500"
                                )}>
                                    {category}
                                    {category === 'My Stash' && <User className="w-3 h-3" />}
                                </div>
                                <div className="space-y-0.5">
                                    {(items as (Preset | UserPreset)[]).map(p => {
                                        const isSelected = p.id === selectedPresetId;
                                        const isUser = 'inputs' in p;
                                        const name = isUser ? (p as UserPreset).name : getPresetName(p as Preset, lang);
                                        
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelect(p)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between group",
                                                    isSelected 
                                                        ? activeItemBg 
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                                                    isUser && isSelected && (isPyriteMode ? "border border-purple-500/30" : "border border-yellow-500/30")
                                                )}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Music className={cn("w-3.5 h-3.5 flex-shrink-0", isSelected ? "text-yellow-400" : "text-zinc-600")} />
                                                    <span className="truncate">{name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isUser && (
                                                        <div 
                                                            onClick={(e) => handleDeleteUserPreset(e, p.id)}
                                                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-zinc-500 text-xs">
                            No presets found.
                        </div>
                    )}
                </div>
            </div>
          )}
      </div>
      
      {/* Actions Toolbar */}
      <div className="flex gap-1">
          <button
              onClick={handleSavePreset}
              className={cn(
                  "p-3 rounded-xl border transition-all active:scale-95",
                  isPyriteMode 
                  ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-500/20 text-purple-400' 
                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              )}
              title="Save Preset to Stash (Ctrl+S)"
          >
              <Save className="w-4 h-4" />
          </button>
          <button
              onClick={onShare}
              className={cn(
                  "p-3 rounded-xl border transition-all active:scale-95",
                  isPyriteMode 
                  ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-500/20 text-purple-400' 
                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              )}
              title={t?.expert?.share || "Share Config"}
          >
              <Link className="w-4 h-4" />
          </button>
          <button
              onClick={onRandomize}
              className={cn(
                  "p-3 rounded-xl border transition-all active:scale-95",
                  isPyriteMode 
                  ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-500/20 text-purple-400' 
                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              )}
              title="Randomize Ideas"
          >
              <Dices className="w-4 h-4" />
          </button>
          <button
              onClick={() => { setSelectedPresetId(''); onClear(); }}
              className={cn(
                  "p-3 rounded-xl border transition-all active:scale-95",
                  isPyriteMode 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] h-10 w-10 flex items-center justify-center'
                  : 'bg-zinc-100 text-black border-white hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 h-10 w-10 flex items-center justify-center'
              )}
              title={lang === 'pl' ? "Nowy Projekt" : "New Project"}
          >
              <FilePlus className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
});

export default PresetSelector;
