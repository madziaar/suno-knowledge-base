
import React, { useMemo, useState } from 'react';
import { HistoryItem } from '../../../types';
import { Trash2, ArrowUpRight, FileAudio, Music, MicVocal, Star, CheckSquare, Square, Activity, Copy, GitCompare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { scorePrompt } from '../../generator/utils';
import ContextMenu, { ContextMenuItem } from '../../../components/shared/ContextMenu';
import { useSettingsState } from '../../../contexts/SettingsContext';

interface HistoryCardProps {
  item: HistoryItem;
  formatDate: (timestamp: number) => string;
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isCompareMode?: boolean;
  t: any;
  style?: React.CSSProperties; // Added for react-window
}

// Helper for icon selection (extracted to avoid re-creation)
const getIcon = (mode: string) => {
  switch(mode) {
      case 'instrumental': return <Music className="w-3.5 h-3.5" />;
      case 'custom': return <FileAudio className="w-3.5 h-3.5" />;
      default: return <MicVocal className="w-3.5 h-3.5" />;
  }
};

const HistoryCard: React.FC<HistoryCardProps> = React.memo(({ item, formatDate, onLoad, onDelete, onToggleFavorite, onSelect, isSelected, isCompareMode, t, style }) => {
  // Fix: Alias isOverclockedMode to isPyriteMode as the component logic expects isPyriteMode
  const { isOverclockedMode: isPyriteMode } = useSettingsState();
  const quality = useMemo(() => scorePrompt(item.result, 'suno'), [item.result]);
  
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number, y: number } | null>(null);

  const scoreColor = quality.status === 'optimal' ? 'text-green-400 border-green-500/30 bg-green-900/10' : 
                     quality.status === 'good' ? 'text-blue-400 border-blue-500/30 bg-blue-900/10' : 
                     quality.status === 'warning' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/10' : 'text-red-400 border-red-500/30 bg-red-900/10';

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const contextItems: ContextMenuItem[] = [
      { 
          label: t.contextMenu.load || "Load", 
          icon: <ArrowUpRight className="w-3 h-3" />, 
          onClick: () => onLoad(item) 
      },
      { 
          label: t.contextMenu.copyStyle || "Copy Style", 
          icon: <Copy className="w-3 h-3" />, 
          onClick: () => navigator.clipboard.writeText(item.result.style)
      },
      { 
          label: t.contextMenu.compare || "Compare", 
          icon: <GitCompare className="w-3 h-3" />, 
          onClick: () => onSelect && onSelect(item.id) 
      },
      {
          label: item.isFavorite ? (t.contextMenu.unfavorite || "Unfavorite") : (t.contextMenu.favorite || "Favorite"),
          icon: <Star className="w-3 h-3" />,
          onClick: () => onToggleFavorite(item.id)
      },
      { 
          label: t.contextMenu.delete || "Delete", 
          icon: <Trash2 className="w-3 h-3" />, 
          onClick: () => onDelete(item.id),
          danger: true
      }
  ];

  return (
    <div style={style} className="px-1 pb-4">
      <div 
        onClick={() => isCompareMode && onSelect ? onSelect(item.id) : onLoad(item)}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onLoad(item)}
        className={cn(
            "group relative w-full h-full rounded-2xl border bg-zinc-900/40 p-5 transition-all duration-300 overflow-hidden text-left cursor-pointer",
            isSelected ? "border-purple-500/50 bg-purple-900/10" : "border-white/5 hover:bg-zinc-900/80 hover:border-yellow-500/20 hover:shadow-lg",
            item.isFavorite && !isSelected ? "border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]" : ""
        )}
      >
        <div className="flex flex-col h-full relative z-10">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isCompareMode ? (
                        <div className={cn("transition-colors", isSelected ? "text-purple-400" : "text-zinc-600")}>
                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            {getIcon(item.inputs.mode)}
                            {item.inputs.mode}
                        </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-600">{formatDate(item.timestamp)}</span>
                </div>
                
                <div className="flex gap-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1", scoreColor)}>
                        <Activity className="w-3 h-3" />
                        {quality.grade}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
                        className={cn(
                            "p-1.5 rounded-full transition-colors hover:bg-white/10",
                            item.isFavorite ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-200"
                        )}
                        title="Toggle Favorite"
                    >
                        <Star className={cn("w-4 h-4", item.isFavorite && "fill-current")} />
                    </button>
                    {!isCompareMode && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="p-1.5 rounded-full hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors"
                            title={t.delete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            
            <h3 className="text-lg font-bold text-white truncate mb-1.5 group-hover:text-yellow-400 transition-colors pr-12">
                {item.result.title || "Untitled Project"}
            </h3>
            
            <p className="text-xs text-zinc-400 font-mono line-clamp-1 opacity-70 mb-3">
                {item.result.tags || "No tags"}
            </p>

            {/* Preview of Style */}
            <div className="relative pl-3 border-l-2 border-white/10 flex-1 mt-auto">
              <p className="text-xs text-zinc-500 line-clamp-2 italic leading-relaxed group-hover:text-zinc-400 transition-colors">
                  "{item.result.style || item.inputs.intent || "No style data"}"
              </p>
            </div>
          </div>

          {!isCompareMode && (
              <div className="flex items-center justify-end mt-4 text-xs font-bold uppercase tracking-widest text-yellow-600 group-hover:text-yellow-400 transition-colors">
                  <span className="flex items-center">
                    {t.load}
                    <ArrowUpRight className="w-4 h-4 ml-1 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
              </div>
          )}
        </div>
      </div>

      <ContextMenu 
        position={contextMenuPos} 
        onClose={() => setContextMenuPos(null)} 
        items={contextItems}
        isPyriteMode={isPyriteMode}
      />
    </div>
  );
}, (prev, next) => {
  return prev.item.id === next.item.id && 
         prev.item.timestamp === next.item.timestamp &&
         prev.item.isFavorite === next.item.isFavorite &&
         prev.isSelected === next.isSelected &&
         prev.isCompareMode === next.isCompareMode &&
         prev.t === next.t; 
});

export default HistoryCard;
