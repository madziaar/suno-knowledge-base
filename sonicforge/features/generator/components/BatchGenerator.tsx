
import React, { useState } from 'react';
import { Sparkles, Copy, Settings2, Dices, GitBranch } from 'lucide-react';
import { GeneratedPrompt, BatchConstraints, BuilderTranslation } from '../../../types';
import ThemedButton from '../../../components/shared/ThemedButton';
import BatchResultCard from './BatchResultCard';
import EvolutionPaths from './Batch/EvolutionPaths';
import { cn } from '../../../lib/utils';
import { sfx } from '../../../lib/audio';

interface BatchGeneratorProps {
  basePrompt: GeneratedPrompt;
  variations: GeneratedPrompt[];
  onGenerate: (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints, evolutionPath?: string) => void;
  onApply: (variation: GeneratedPrompt) => void;
  onExport: (selected: number[]) => void;
  isGenerating: boolean;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  basePrompt,
  variations,
  onGenerate,
  onApply,
  onExport,
  isGenerating,
  isPyriteMode,
  t
}) => {
  const [count, setCount] = useState(3);
  const [level, setLevel] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [evolutionPath, setEvolutionPath] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<BatchConstraints>({
    keepGenre: true,
    keepStructure: false,
    randomizeMood: false,
    randomizeVocals: false,
  });
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleToggleConstraint = (key: keyof BatchConstraints) => {
    setConstraints(prev => ({ ...prev, [key]: !prev[key] }));
    sfx.play('click');
  };

  const handleSelectPath = (pathId: string) => {
      setEvolutionPath(prev => prev === pathId ? null : pathId);
      sfx.play('secret');
  };

  const handleSelect = (index: number, checked: boolean) => {
    setSelectedIndices(prev =>
      checked ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

  const handleGenerate = () => {
      onGenerate(count, level, constraints, evolutionPath || undefined);
  };

  const CONSTRAINT_CONFIG = [
    { key: 'keepGenre', label: t.batch.constraints.genre },
    { key: 'keepStructure', label: t.batch.constraints.structure },
    { key: 'randomizeMood', label: t.batch.constraints.mood },
    { key: 'randomizeVocals', label: t.batch.constraints.vocals },
  ];

  return (
    <details className="group" open>
      <summary className="list-none cursor-pointer flex items-center justify-between py-4 border-t border-white/5 text-zinc-400 hover:text-white transition-colors select-none">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Sparkles className={cn("w-4 h-4", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
          {t.batch.title}
        </h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-500 group-open:hidden">
                {variations.length > 0 ? `${variations.length} ${t.batch.results.toLowerCase()}` : t.batch.configure}
            </span>
            <span className="text-xs font-mono group-open:rotate-180 transition-transform">▼</span>
        </div>
      </summary>
      
      <div className="pb-4 space-y-6 animate-in slide-in-from-top-2">
        <div className={cn(
            "p-5 rounded-xl border space-y-6",
            isPyriteMode ? "bg-purple-900/5 border-purple-500/20" : "bg-black/20 border-white/5"
        )}>
            {/* Evolution Paths */}
            <EvolutionPaths 
                selectedPath={evolutionPath} 
                onSelect={handleSelectPath} 
                isPyriteMode={isPyriteMode} 
            />

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1.5">
                        <Settings2 className="w-3 h-3" /> {t.batch.intensity}
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    {(['light', 'medium', 'heavy'] as const).map(l => (
                        <button 
                            key={l} 
                            onClick={() => { setLevel(l); sfx.play('click'); }} 
                            className={cn(
                                "px-2 py-1.5 text-[9px] md:text-xs font-bold rounded capitalize transition-all", 
                                level === l 
                                    ? (isPyriteMode ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-700 text-white shadow-lg') 
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            )}
                        >
                        {t.batch.levels[l]}
                        </button>
                    ))}
                    </div>
                </div>
                
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1.5">
                        <Copy className="w-3 h-3" /> {t.batch.count}: <span className={isPyriteMode ? "text-purple-400" : "text-yellow-500"}>{count}</span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={count} 
                        onChange={e => { setCount(parseInt(e.target.value)); sfx.play('light'); }} 
                        className={cn(
                            "w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer", 
                            isPyriteMode ? 'accent-purple-500' : 'accent-yellow-500'
                        )} 
                    />
                </div>
            </div>

            {/* Constraints */}
            <div className="pt-2 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-3 block">{t.batch.constraints.title}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CONSTRAINT_CONFIG.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors group">
                            <div className={cn(
                                "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                constraints[key as keyof BatchConstraints] 
                                    ? (isPyriteMode ? "bg-purple-600 border-purple-500" : "bg-yellow-600 border-yellow-500")
                                    : "bg-zinc-900 border-zinc-700 group-hover:border-zinc-500"
                            )}>
                                {constraints[key as keyof BatchConstraints] && <span className="text-[10px] text-white font-bold">✓</span>}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={constraints[key as keyof BatchConstraints]} 
                                onChange={() => handleToggleConstraint(key as keyof BatchConstraints)} 
                                className="hidden" 
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <ThemedButton 
                    onClick={handleGenerate} 
                    isLoading={isGenerating} 
                    variant={isPyriteMode ? 'pyrite' : 'default'} 
                    className="px-6 py-2 text-xs"
                    icon={<Dices className="w-4 h-4" />}
                >
                    {t.batch.generate.replace('Variations', '')} {count} {t.batch.variations}
                </ThemedButton>
            </div>
        </div>

        {/* Results Grid */}
        {variations.length > 0 && !isGenerating && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 px-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.batch.results} ({variations.length})</span>
                    <ThemedButton 
                        onClick={() => onExport(selectedIndices)} 
                        disabled={selectedIndices.length === 0} 
                        variant="zinc" 
                        className="px-3 py-1.5 text-[10px] h-auto min-h-0"
                    >
                        {t.batch.export} ({selectedIndices.length})
                    </ThemedButton>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {variations.map((v, i) => (
                        <BatchResultCard
                            key={i}
                            basePrompt={basePrompt}
                            variation={v}
                            onApply={() => onApply(v)}
                            onSelect={(checked) => handleSelect(i, checked)}
                            isSelected={selectedIndices.includes(i)}
                            isPyriteMode={isPyriteMode}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        )}
      </div>
    </details>
  );
};

export default BatchGenerator;
