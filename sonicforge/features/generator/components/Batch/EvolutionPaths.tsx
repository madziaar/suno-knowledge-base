
import React, { memo } from 'react';
import { Skull, Zap, Wind, Cpu, Sparkles, Flame, Waves, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EvolutionPath {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const PATHS: EvolutionPath[] = [
  { id: 'darken', name: 'Darken', description: 'Inject minor keys and minor-key tension', icon: Skull, color: 'text-red-500' },
  { id: 'metalize', name: 'Metalize', description: 'Force heavy distortion and double kick', icon: Flame, color: 'text-orange-500' },
  { id: 'glitch', name: 'Glitchify', description: 'Add stuttering effects and bitcrushing', icon: Cpu, color: 'text-purple-400' },
  { id: 'acoustic', name: 'Unplugged', description: 'Strip back to organic instruments', icon: Wind, color: 'text-blue-400' },
  { id: 'pop', name: 'Popify', description: 'Add catchy hooks and polished production', icon: Sparkles, color: 'text-pink-400' },
  { id: 'ambient', name: 'Drift', description: 'Expand reverb tails and wash out drums', icon: Waves, color: 'text-cyan-400' },
  { id: 'retro', name: 'Vintage', description: 'Apply 80s tape hiss and analog warmth', icon: Radio, color: 'text-yellow-500' },
];

interface EvolutionPathsProps {
  selectedPath: string | null;
  onSelect: (pathId: string) => void;
  isPyriteMode: boolean;
}

const EvolutionPaths: React.FC<EvolutionPathsProps> = memo(({ selectedPath, onSelect, isPyriteMode }) => {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Genetic Drift Vectors</label>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {PATHS.map((path) => {
          const isActive = selectedPath === path.id;
          return (
            <button
              key={path.id}
              onClick={() => onSelect(path.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 group",
                isActive 
                  ? (isPyriteMode ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]")
                  : "bg-black/40 border-white/5 hover:border-white/20"
              )}
              title={path.description}
            >
              <path.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : path.color
              )} />
              <span className={cn(
                "text-[8px] font-bold uppercase truncate w-full text-center",
                isActive ? "text-white" : "text-zinc-500"
              )}>
                {path.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default EvolutionPaths;
