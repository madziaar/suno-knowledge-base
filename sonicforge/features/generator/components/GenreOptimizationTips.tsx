
import React, { useMemo } from 'react';
import { Lightbulb, Info, Layers, MapPin, Mic2, ShieldAlert } from 'lucide-react';
import { getGenreOptimizations } from '../utils/genreOptimizer';
import { cn } from '../../../../lib/utils';

interface GenreOptimizationTipsProps {
  genre: string;
  isPyriteMode: boolean;
}

const GenreOptimizationTips: React.FC<GenreOptimizationTipsProps> = ({ genre, isPyriteMode }) => {
  // Handle multi-genre strings (take the first one)
  const primaryGenre = genre.split(',')[0].trim();
  const suggestions = useMemo(() => getGenreOptimizations(primaryGenre), [primaryGenre]);

  if (!primaryGenre || suggestions.length === 0) return null;

  const bgClass = isPyriteMode ? 'bg-purple-900/10 border-purple-500/20' : 'bg-yellow-900/10 border-yellow-500/20';
  const textClass = isPyriteMode ? 'text-purple-300' : 'text-yellow-600';
  const iconClass = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';

  return (
    <div className={cn("rounded-xl border p-3 mt-3 animate-in fade-in slide-in-from-top-1", bgClass)}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className={cn("w-4 h-4", iconClass)} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", textClass)}>
          Optimization: {primaryGenre}
        </span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] md:text-xs text-zinc-400 leading-relaxed">
            <div className="mt-0.5 min-w-[14px]">
                {s.type === 'technique' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                {s.type === 'structure' && <Layers className="w-3.5 h-3.5 text-green-400" />}
                {s.type === 'regional' && <MapPin className="w-3.5 h-3.5 text-red-400" />}
                {s.type === 'vocal' && <Mic2 className="w-3.5 h-3.5 text-pink-400" />}
                {s.type === 'tag' && <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />}
            </div>
            <span>{s.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreOptimizationTips;
