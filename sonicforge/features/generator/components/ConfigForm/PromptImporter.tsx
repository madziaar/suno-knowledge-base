
import React, { useState } from 'react';
import { Import, X, ArrowRight, Activity, Music2, Settings2, Mic2 } from 'lucide-react';
import { parseStylePrompt, analyzeLyrics } from '../../utils/promptParser'; // Existing parser
import { SongConcept, ExpertInputs } from '../../../../types';
import GlassPanel from '../../../../components/shared/GlassPanel';
import ThemedButton from '../../../../components/shared/ThemedButton';
import { cn } from '../../../../lib/utils';
// Note: promptAnalysis.ts functions (scorePrompt, comparePrompts, extractTemplate) 
// are for a broader analysis and not directly consumed by the importer itself,
// which focuses on breaking down a raw string into form fields.

interface PromptImporterProps {
  onApply: (data: Partial<SongConcept>, expertData: Partial<ExpertInputs>) => void;
  onClose: () => void;
  isPyriteMode: boolean;
}

const PromptImporter: React.FC<PromptImporterProps> = ({ onApply, onClose, isPyriteMode }) => {
  const [input, setInput] = useState('');
  const [analyzed, setAnalyzed] = useState<any>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    const styleData = parseStylePrompt(input); // Use existing parser for style
    const lyricsData = analyzeLyrics(input); // Use existing parser for lyrics stats
    setAnalyzed({ styleData, lyricsData });
  };

  const handleImport = () => {
    if (!analyzed) return;
    
    const { styleData, lyricsData } = analyzed;
    
    // Map to SongConcept
    const newInputs: Partial<SongConcept> = {
      intent: [...styleData.remaining, ...styleData.production].join(', '),
      mood: styleData.moods.join(', '),
      instruments: styleData.instruments.join(', '),
      // If full prompt paste includes lyrics, update inputs
      lyricsInput: input.includes('[') ? input : undefined
    };

    // Map to ExpertInputs
    const newExpert: Partial<ExpertInputs> = {
      genre: styleData.genres[0] || '',
      bpm: styleData.bpm || '',
      key: styleData.key || '',
      techAnchor: styleData.production[0] || ''
    };

    onApply(newInputs, newExpert);
    onClose();
  };

  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-zinc-700';
  const accentText = isPyriteMode ? 'text-purple-400' : 'text-blue-400';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <Import className="w-4 h-4" />
            Import & Analyze Prompt
          </h3>
          <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Paste Style String or Full Prompt
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={cn(
                "w-full h-32 bg-black/40 border rounded-xl p-4 text-sm text-zinc-200 outline-none resize-none font-mono",
                borderColor,
                isPyriteMode ? "focus:border-purple-500" : "focus:border-blue-500"
              )}
              placeholder="e.g. Dark Techno, 140 bpm, Industrial, Aggressive Synth..."
            />
          </div>

          <div className="flex justify-end">
             <ThemedButton 
                onClick={handleAnalyze} 
                disabled={!input.trim()}
                variant={isPyriteMode ? 'pyrite' : 'default'}
             >
                Analyze
             </ThemedButton>
          </div>

          {analyzed && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 pt-4 border-t border-white/10">
               <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Analysis Result</h4>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                     <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-300">
                        <Activity className="w-3 h-3" />
                        Technical
                     </div>
                     <div className="space-y-1 text-xs text-zinc-400 font-mono">
                        <p>BPM: <span className="text-white">{analyzed.styleData.bpm || 'N/A'}</span></p>
                        <p>Key: <span className="text-white">{analyzed.styleData.key || 'N/A'}</span></p>
                     </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                     <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-300">
                        <Music2 className="w-3 h-3" />
                        Genre & Mood
                     </div>
                     <div className="space-y-1 text-xs text-zinc-400">
                        <p>Genres: <span className={accentText}>{analyzed.styleData.genres.join(', ') || 'N/A'}</span></p>
                        <p>Moods: <span className="text-white">{analyzed.styleData.moods.join(', ') || 'N/A'}</span></p>
                     </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                     <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-300">
                        <Settings2 className="w-3 h-3" />
                        Production
                     </div>
                     <div className="space-y-1 text-xs text-zinc-400">
                        <p>Instruments: <span className="text-white">{analyzed.styleData.instruments.join(', ') || 'N/A'}</span></p>
                        <p>Prod: <span className="text-white">{analyzed.styleData.production.join(', ') || 'N/A'}</span></p>
                     </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                     <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-300">
                        <Mic2 className="w-3 h-3" />
                        Vocals & Lyrics
                     </div>
                     <div className="space-y-1 text-xs text-zinc-400">
                        <p>Style: <span className="text-white">{analyzed.styleData.vocals.join(', ') || 'N/A'}</span></p>
                        {analyzed.lyricsData && (
                            <p>Duration: ~<span className="text-green-400">{analyzed.lyricsData.estimatedDuration}</span></p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center">
           <button onClick={onClose} className="text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider">Cancel</button>
           <ThemedButton 
             onClick={handleImport} 
             disabled={!analyzed}
             variant={isPyriteMode ? 'pyrite' : 'default'}
             className="px-6"
           >
             Apply to Forge
             <ArrowRight className="w-4 h-4 ml-2" />
           </ThemedButton>
        </div>

      </GlassPanel>
    </div>
  );
};

export default PromptImporter;
