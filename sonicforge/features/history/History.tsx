
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { HistoryItem, Language } from '../../types';
import { translations } from '../../translations';
import { Clock, Trash2, Database, Search, X, Download, Wand2, GitCompare } from 'lucide-react';
import HistoryCard from './components/HistoryCard';
import HistoryCompare from './components/HistoryCompare';
import ThemedButton from '../../components/shared/ThemedButton';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useHistoryState, useHistoryDispatch, useSettingsState, useUIDispatch } from '../../contexts';

const History: React.FC = () => {
  const { history } = useHistoryState();
  const { toggleFavorite, loadFromHistory, deleteFromHistory, clearHistory, exportHistory } = useHistoryDispatch();
  // Fix: Alias isOverclockedMode to isPyriteMode as the component logic expects isPyriteMode
  const { isOverclockedMode: isPyriteMode, lang } = useSettingsState();
  const { setActiveTab, showToast } = useUIDispatch();
  
  const t = translations[lang].history;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });
  
  const numberFormat = useMemo(() => new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-US'), [lang]);
  
  const formatDate = useCallback((timestamp: number) => {
    return new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }, [lang]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const lower = searchTerm.toLowerCase();
    return history.filter(item => 
        (item.result.title?.toLowerCase().includes(lower)) || 
        (item.result.tags?.toLowerCase().includes(lower)) ||
        (item.inputs.intent?.toLowerCase().includes(lower))
    );
  }, [history, searchTerm]);

  const handleSelectForCompare = (id: string) => {
      setSelectedIds(prev => {
          if (prev.includes(id)) return prev.filter(i => i !== id);
          if (prev.length >= 2) return [prev[1], id];
          return [...prev, id];
      });
  };

  const compareItems = useMemo(() => {
      if (selectedIds.length !== 2) return null;
      return {
          itemA: history.find(h => h.id === selectedIds[0]),
          itemB: history.find(h => h.id === selectedIds[1])
      };
  }, [selectedIds, history]);

  const handleExportAll = useCallback(() => {
    const result = exportHistory();
    showToast(result.message, result.success ? 'success' : 'info');
  }, [exportHistory, showToast]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          height: entry.contentRect.height,
          width: entry.contentRect.width
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = filteredHistory[index];
    const itemStyle = {
        ...style,
        left: Number(style.left) + 4,
        width: Number(style.width) - 16,
        height: Number(style.height) - 10,
        top: Number(style.top) + 5
    };

    return (
        <HistoryCard
            key={item.id}
            item={item}
            formatDate={formatDate}
            onLoad={loadFromHistory}
            onDelete={deleteFromHistory}
            onToggleFavorite={toggleFavorite}
            onSelect={handleSelectForCompare}
            isSelected={selectedIds.includes(item.id)}
            isCompareMode={isCompareMode}
            t={t}
            style={itemStyle}
        />
    );
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl p-8">
        <Database className="w-16 h-16 mb-6 opacity-20" />
        <p className="text-xl font-bold text-zinc-300 mb-2">{t.empty}</p>
        <p className="text-sm text-zinc-500 mb-8 max-w-xs text-center">{t.emptyDesc}</p>
        <ThemedButton onClick={() => setActiveTab('forge')} className="px-6 py-3 text-sm">
            <Wand2 className="w-4 h-4 mr-2" />
            {t.createFirst}
        </ThemedButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            {t.title}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder.replace('{0}', numberFormat.format(history.length))}
                    className="pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500 w-full md:w-48"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
            
            <button
                onClick={() => {
                    setIsCompareMode(!isCompareMode);
                    setSelectedIds([]);
                }}
                className={`flex items-center text-xs px-3 py-2 rounded-lg transition-colors border ${isCompareMode ? (isPyriteMode ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' : 'bg-blue-900/30 border-blue-500/50 text-blue-300') : 'text-zinc-400 border-transparent hover:bg-white/5'}`}
                title="Compare Prompts"
            >
                <GitCompare className="w-4 h-4 mr-1.5" />
                {isCompareMode ? (lang === 'pl' ? 'Gotowe' : 'Done') : t.contextMenu.compare}
            </button>

            <button
                onClick={handleExportAll}
                className="flex items-center text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-900"
                title="Export All Archives as JSON"
            >
                <Download className="w-4 h-4" />
            </button>
            <button
                onClick={clearHistory}
                className="flex items-center text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-900"
                title={t.clear}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex-1 border border-zinc-800/50 rounded-2xl bg-zinc-900/20 overflow-hidden relative" ref={containerRef}>
        {filteredHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
                {lang === 'pl' ? `Brak wyników dla "${searchTerm}"` : `No results found for "${searchTerm}"`}
            </div>
        ) : (
            <List
                height={dimensions.height}
                width={dimensions.width}
                itemCount={filteredHistory.length}
                itemSize={160}
            >
                {Row}
            </List>
        )}
        
        {isCompareMode && selectedIds.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-bottom-4 z-20">
                <span className="text-xs font-bold text-zinc-300">
                    {numberFormat.format(selectedIds.length)} / {numberFormat.format(2)} {lang === 'pl' ? 'zaznaczono' : 'selected'}
                </span>
                {selectedIds.length === 2 && (
                    <ThemedButton 
                        variant={isPyriteMode ? 'pyrite' : 'default'} 
                        className="px-4 py-1.5 text-xs h-auto"
                        onClick={() => setShowCompareModal(true)}
                    >
                        {t.contextMenu.compare}
                    </ThemedButton>
                )}
            </div>
        )}
      </div>

      {showCompareModal && compareItems?.itemA && compareItems?.itemB && (
          <HistoryCompare 
            itemA={compareItems.itemA} 
            itemB={compareItems.itemB} 
            onClose={() => setShowCompareModal(false)}
            isPyriteMode={isPyriteMode} 
          />
      )}
    </div>
  );
};

export default History;
