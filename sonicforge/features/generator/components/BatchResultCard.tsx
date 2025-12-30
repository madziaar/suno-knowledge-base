
import React, { useMemo } from 'react';
import { GeneratedPrompt, BuilderTranslation } from '../../../types';
import { validateSunoPrompt } from '../utils/sunoValidator';
import { diffStyleStrings } from '../utils/promptDiff';
import { cn } from '../../../lib/utils';
import { Check, CheckCircle, Activity } from 'lucide-react';

interface BatchResultCardProps {
  basePrompt: GeneratedPrompt;
  variation: GeneratedPrompt;
  onApply: () => void;
  onSelect: (checked: boolean) => void;
  isSelected: boolean;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const BatchResultCard: React.FC<BatchResultCardProps> = ({
  basePrompt,
  variation,
  onApply,
  onSelect,
  isSelected,
  isPyriteMode,
  t
}) => {
  const validation = useMemo(() => validateSunoPrompt(variation), [variation]);
  const diff = useMemo(() => diffStyleStrings(basePrompt.style, variation.style), [basePrompt.style, variation.style]);

  const scoreColor = 
    validation.status === 'optimal' ? 'text-green-400' :
    validation.status === 'good' ? 'text-green-400' :
    validation.status === 'warning' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-2 relative',
        isSelected
          ? (isPyriteMode ? 'bg-purple-900/30 border-purple-500/50' : 'bg-zinc-800 border-zinc-600')
          : (isPyriteMode ? 'bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80')
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="checkbox" checked={isSelected} onChange={(e) => onSelect(e.target.checked)} className="hidden" />
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${isSelected ? (isPyriteMode ? 'bg-purple-500 border-purple-400' : 'bg-yellow-500 border-yellow-400') : 'bg-zinc-800 border-zinc-700'}`}>
              {isSelected && <Check className="w-3 h-3 text-black" />}
            </div>
          </label>
          <div>
            <p className="text-sm font-bold text-white">{variation.title}</p>
            <p className="text-[10px] text-zinc-500 italic">{variation.analysis}</p>
          </div>
        </div>
        <div className={cn("flex items-center text-xs font-mono font-bold", scoreColor)}>
          {validation.status === 'optimal' || validation.status === 'good' ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Activity className="w-3.5 h-3.5 mr-1" />}
          {validation.score}%
        </div>
      </div>

      <div className="space-y-2 text-xs font-mono">
        {diff.added.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-green-400 font-bold">+</span>
            {diff.added.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-green-900/50 text-green-300 rounded text-[10px]">{tag}</span>)}
          </div>
        )}
        {diff.removed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-red-400 font-bold">-</span>
            {diff.removed.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-red-900/50 text-red-300 rounded text-[10px] line-through">{tag}</span>)}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={onApply} className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline">
          {t.batch.usePrompt}
        </button>
      </div>
    </div>
  );
};

export default BatchResultCard;
