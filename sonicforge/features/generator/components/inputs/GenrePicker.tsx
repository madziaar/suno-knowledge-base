
import React, { useState, useMemo, memo } from 'react';
import { Search, X, Zap, AlertTriangle, Music, Check, Sparkles } from 'lucide-react';
import { GENRE_DATABASE } from '../../data/genreDatabase';
import { BuilderTranslation } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import Tooltip from '../../../../components/Tooltip';

interface GenrePickerProps {
  value: string[];
  onChange: (genres: string[]) => void;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const GenrePicker: React.FC<GenrePickerProps> = memo(({ value, onChange, isPyriteMode, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(GENRE_DATABASE.map(g => g.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const handleToggle = (genreName: string) => {
    sfx.play('click');
    const newSelection = value.includes(genreName)
      ? value.filter(g => g !== genreName)
      : [...value, genreName];
    onChange(newSelection);
  };

  const handleRefine = () => {
    sfx.play('secret');
    let newSelection = [...value];
    let added = false;

    // Analyze currently selected genres to find relevant refinements
    // We prioritize the first selected genre as the "Anchor"
    const primary = value[0];
    
    if (primary) {
        // Find the definition in the DB (either main name or subgenre)
        const def = GENRE_DATABASE.find(g => g.name === primary || g.subGenres.includes(primary));
        
        if (def) {
             // Create a pool of potential refinements: Subgenres + Characteristics
             const pool = [...def.subGenres, ...def.characteristics];
             
             // Filter out what's already selected
             const available = pool.filter(p => !newSelection.includes(p));
             
             if (available.length > 0) {
                 // Pick one random refinement to add
                 const pick = available[Math.floor(Math.random() * available.length)];
                 newSelection.push(pick);
                 added = true;
             }
        }
    }

    if (added) {
        onChange(newSelection);
    }
  };
  
  const filteredGenres = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return GENRE_DATABASE.filter(g => {
        const categoryMatch = activeCategory === 'All' || g.category === activeCategory;
        const searchMatch = !searchQuery ||
            g.name.toLowerCase().includes(lowerQuery) ||
            g.subGenres.some(sub => sub.toLowerCase().includes(lowerQuery));
        return categoryMatch && searchMatch;
    });
  }, [searchQuery, activeCategory]);

  const { bpmRange, recommendedKeys } = useMemo(() => {
    if (value.length === 0) return { bpmRange: null, recommendedKeys: [] };
    
    let minBpm = Infinity;
    let maxBpm = 0;
    const keySet = new Set<string>();

    value.forEach(genreName => {
      const genreDef = GENRE_DATABASE.find(g => g.name === genreName || g.subGenres.includes(genreName));
      if (genreDef) {
        minBpm = Math.min(minBpm, genreDef.bpmRange[0]);
        maxBpm = Math.max(maxBpm, genreDef.bpmRange[1]);
        genreDef.commonKeys.forEach(k => keySet.add(k));
      }
    });

    const bpmRange = minBpm === Infinity ? null : `${minBpm}-${maxBpm} BPM`;
    const recommendedKeys = Array.from(keySet).slice(0, 4);

    return { bpmRange, recommendedKeys };
  }, [value]);
  
  // Style Vars
  const activeTabClass = isPyriteMode ? 'bg-purple-600/20 text-purple-200' : 'bg-white/10 text-white';
  const inactiveTabClass = 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300';
  const accentText = isPyriteMode ? 'text-purple-300' : 'text-blue-300';
  const chipBg = isPyriteMode ? 'bg-purple-900/50 border-purple-500/50' : 'bg-blue-900/50 border-blue-500/50';

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center">
            <Music className="w-3 h-3 mr-1.5" />
            {t.expert.genre || "Genre"}
            </label>
            <Tooltip content={t.tooltips.genre} />
        </div>
        
        {/* Refine Button */}
        {value.length > 0 && (
             <button 
                onClick={handleRefine}
                className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all border group",
                    isPyriteMode 
                        ? "bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                        : "bg-yellow-900/20 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                )}
                title="Deepen specificity by adding sub-genres or characteristics"
             >
                 <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                 Refine
             </button>
        )}
      </div>

      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5 animate-in fade-in">
          {value.map(genre => (
            <div key={genre} className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-bold ${chipBg} ${accentText}`}>
              <span>{genre}</span>
              <button onClick={() => handleToggle(genre)} className="bg-black/30 rounded-full p-0.5 hover:bg-red-500/50 hover:text-white">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat ? activeTabClass : inactiveTabClass}`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Search & Recommendations */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search genres..."
            className="w-full pl-8 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        {(bpmRange || recommendedKeys.length > 0) && (
          <div className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10 text-xs flex items-center justify-around font-mono">
            {bpmRange && <div className="text-center"><div className="font-bold text-white">{bpmRange}</div><div className="text-[9px] text-zinc-500">BPM</div></div>}
            {recommendedKeys.length > 0 && <div className="text-center"><div className="font-bold text-white">{recommendedKeys.join(', ')}</div><div className="text-[9px] text-zinc-500">Keys</div></div>}
          </div>
        )}
      </div>

      {/* Genre List */}
      <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
        {filteredGenres.map(genre => {
          const isSelected = value.includes(genre.name);
          return (
            <div key={genre.name} className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-white/5' : ''}`}>
              <button
                onClick={() => handleToggle(genre.name)}
                className={`w-full flex justify-between items-center text-left text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <span>{genre.name}</span>
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-white border-white' : 'border-zinc-700 bg-zinc-800'}`}>
                  {isSelected && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>
              {/* Subgenres */}
              <div className="pl-6 pt-2 flex flex-wrap gap-2">
                {genre.subGenres.map(sub => {
                  const isSubSelected = value.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => handleToggle(sub)}
                      className={`px-2 py-0.5 text-[10px] rounded-full border transition-all ${isSubSelected ? `${chipBg} ${accentText}` : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
});

export default GenrePicker;
