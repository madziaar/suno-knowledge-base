
import React, { useMemo } from 'react';
import { HistoryItem } from '../../../types';
import { comparePrompts, scorePrompt } from '../../generator/utils';
import GlassPanel from '../../../components/shared/GlassPanel';
import { X, ArrowRight, ArrowLeft, GitCompare } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HistoryCompareProps {
  itemA: HistoryItem;
  itemB: HistoryItem;
  onClose: () => void;
  isPyriteMode: boolean;
}

const HistoryCompare: React.FC<HistoryCompareProps> = ({ itemA, itemB, onClose, isPyriteMode }) => {
  const comparison = useMemo(() => comparePrompts(itemA.result, itemB.result), [itemA, itemB]);
  const scoreA = useMemo(() => scorePrompt(itemA.result, 'suno'), [itemA]);
  const scoreB = useMemo(() => scorePrompt(itemB.result, 'suno'), [itemB]);

  const getScoreColor = (grade: string) => {
      if (['S', 'A+', 'A'].includes(grade)) return 'text-green-400';
      if (['B'].includes(grade)) return 'text-blue-400';
      return 'text-yellow-400';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
        <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl p-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <GitCompare className="w-4 h-4" />
                    Prompt Comparator
                </h3>
                <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 divide-x divide-white/10 min-h-full">
                    {/* Column A */}
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <h4 className="font-bold text-white text-lg">{itemA.result.title || "Untitled A"}</h4>
                                <p className="text-xs text-zinc-500 font-mono">{new Date(itemA.timestamp).toLocaleString()}</p>
                            </div>
                            <div className={cn("text-3xl font-bold font-mono", getScoreColor(scoreA.grade))}>{scoreA.grade}</div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Style Prompt</h5>
                                <div className="text-sm text-zinc-300 font-mono leading-relaxed bg-black/20 p-3 rounded-lg relative">
                                    {itemA.result.style}
                                    {comparison.style.removed.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <p className="text-[9px] text-red-400 mb-1 font-bold uppercase">Unique to A:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {comparison.style.removed.map((tag, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-red-900/30 text-red-300 rounded text-[10px] border border-red-500/20">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Metadata</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                                    <div className="bg-white/5 p-2 rounded">
                                        <span className="block text-[9px] text-zinc-500 uppercase">Completeness</span>
                                        {scoreA.breakdown.completeness}/30
                                    </div>
                                    <div className="bg-white/5 p-2 rounded">
                                        <span className="block text-[9px] text-zinc-500 uppercase">Specificity</span>
                                        {scoreA.breakdown.specificity}/30
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column B */}
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <h4 className="font-bold text-white text-lg">{itemB.result.title || "Untitled B"}</h4>
                                <p className="text-xs text-zinc-500 font-mono">{new Date(itemB.timestamp).toLocaleString()}</p>
                            </div>
                            <div className={cn("text-3xl font-bold font-mono", getScoreColor(scoreB.grade))}>{scoreB.grade}</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Style Prompt</h5>
                                <div className="text-sm text-zinc-300 font-mono leading-relaxed bg-black/20 p-3 rounded-lg relative">
                                    {itemB.result.style}
                                    {comparison.style.added.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <p className="text-[9px] text-green-400 mb-1 font-bold uppercase">Unique to B:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {comparison.style.added.map((tag, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-green-900/30 text-green-300 rounded text-[10px] border border-green-500/20">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Metadata</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                                    <div className="bg-white/5 p-2 rounded">
                                        <span className="block text-[9px] text-zinc-500 uppercase">Completeness</span>
                                        {scoreB.breakdown.completeness}/30
                                    </div>
                                    <div className="bg-white/5 p-2 rounded">
                                        <span className="block text-[9px] text-zinc-500 uppercase">Specificity</span>
                                        {scoreB.breakdown.specificity}/30
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassPanel>
    </div>
  );
};

export default HistoryCompare;