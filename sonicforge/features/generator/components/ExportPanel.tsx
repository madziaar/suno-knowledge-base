
import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Copy, Share2, QrCode, Twitter, Mail, Mic2, Music, Hash } from 'lucide-react';
import { GeneratedPrompt, BuilderTranslation, ToastTranslation, SongConcept, ExpertInputs } from '../../../../types';
import GlassPanel from '../../../../components/shared/GlassPanel';
import ThemedButton from '../../../../components/shared/ThemedButton';
import { cn } from '../../../../lib/utils';
import { exportAsJSON, exportAsMarkdown, exportAsSunoText, exportAsTextFile } from '../../../../lib/export-utils';
import { compressState, generateShareLinks } from '../../../../lib/sharing';
import { sfx } from '../../../../lib/audio';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: GeneratedPrompt;
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isExpertMode: boolean;
  isPyriteMode: boolean;
  t: BuilderTranslation;
  toast: ToastTranslation;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const VOCAL_SNIPPETS = [
    { label: 'Echo', value: '(echo)' },
    { label: 'Gasp', value: '(gasp)' },
    { label: 'Runs', value: '(vocal runs)' },
    { label: 'Laugh', value: '(laughs)' },
    { label: 'Belting', value: '[High Note]' },
    { label: 'Scream', value: '[Distorted Scream]' },
    { label: 'Soft', value: '(whispered)' },
    { label: 'Chorus+', value: '[Chorus | Anthemic]' },
];

const ExportPanel: React.FC<ExportPanelProps> = ({
  isOpen, onClose, result, inputs, expertInputs, isExpertMode, isPyriteMode, t, toast, showToast,
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ twitter: string; reddit: string; email: string; } | null>(null);
  
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${fieldName} ${toast.copied}`, 'success');
    sfx.play('light');
  };

  useEffect(() => {
    if (isOpen) {
      const generateUrl = async () => {
        const url = await compressState(inputs, expertInputs, isExpertMode, isPyriteMode);
        setShareUrl(url);
        setSocialLinks(generateShareLinks(result.title, url));
      };
      generateUrl();
    }
  }, [isOpen, inputs, expertInputs, isExpertMode, isPyriteMode, result.title]);

  if (!isOpen) return null;
  
  const te = t.exportPanel;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <Share2 className="w-4 h-4" />
            {te.title}
          </h3>
          <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Core Assets */}
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Music className="w-3.5 h-3.5" /> Core Synthesis
              </h4>
              <div className="space-y-2">
                <CopyButton label={t.output.titleLabel} onCopy={() => handleCopy(result.title, t.output.titleLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.tagsLabel} onCopy={() => handleCopy(result.tags, t.output.tagsLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.styleDescLabel} onCopy={() => handleCopy(result.style, t.output.styleDescLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.lyricsLabel} onCopy={() => handleCopy(result.lyrics, t.output.lyricsLabel)} isPyriteMode={isPyriteMode} />
                <div className="h-px bg-white/5 my-2" />
                <CopyButton label={te.fullSuno} onCopy={() => handleCopy(exportAsSunoText(result), te.fullSuno)} isPyriteMode={isPyriteMode} highlight />
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Extraction
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <ThemedButton onClick={() => { exportAsTextFile(exportAsSunoText(result), `${result.title}.txt`); showToast(toast.downloaded, 'success'); }} variant="zinc" className="text-[10px] py-3 uppercase tracking-widest">{t.output.exportSuno}</ThemedButton>
                <ThemedButton onClick={() => { exportAsJSON({ inputs, expertInputs, result, timestamp: Date.now() }, `${result.title}.json`); showToast(toast.downloaded, 'success'); }} variant="zinc" className="text-[10px] py-3 uppercase tracking-widest">{t.output.exportJson}</ThemedButton>
              </div>
            </section>
          </div>

          {/* Column 2: Performance Snippets (New) */}
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Mic2 className="w-3.5 h-3.5" /> Performance Cues
              </h4>
              <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed italic">
                  Inject these into your lyrics for authentic V4.5 vocal nuance.
              </p>
              <div className="grid grid-cols-2 gap-2">
                  {VOCAL_SNIPPETS.map(snippet => (
                      <button
                        key={snippet.label}
                        onClick={() => handleCopy(snippet.value, snippet.label)}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 text-left transition-all group"
                      >
                          <div className="text-[10px] font-bold text-zinc-400 group-hover:text-purple-300 uppercase tracking-tighter mb-1">{snippet.label}</div>
                          <div className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400">{snippet.value}</div>
                      </button>
                  ))}
              </div>
            </section>
          </div>

          {/* Column 3: Uplink & QR */}
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Neural Uplink
              </h4>
              <div className={cn("p-5 rounded-2xl border flex flex-col items-center", isPyriteMode ? "bg-purple-900/10 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "bg-black/20 border-white/5")}>
                <div className="p-3 bg-white rounded-2xl mb-4 shadow-2xl">
                    {shareUrl ? (
                        <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
                        alt="QR Code"
                        width={140}
                        height={140}
                        className="rounded-lg"
                        />
                    ) : (
                        <div className="w-[140px] h-[140px] bg-zinc-200 animate-pulse rounded-lg" />
                    )}
                </div>
                
                <div className="w-full space-y-3">
                    <ThemedButton onClick={() => handleCopy(shareUrl, 'Link')} variant="outline" className="w-full text-xs py-2.5 rounded-xl">
                    {te.copyLink}
                    </ThemedButton>
                    
                    <div className="flex gap-2">
                        <a href={socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <ThemedButton variant="zinc" className="w-full py-2.5"><Twitter className="w-4 h-4" /></ThemedButton>
                        </a>
                        <a href={socialLinks?.email} className="flex-1">
                            <ThemedButton variant="zinc" className="w-full py-2.5"><Mail className="w-4 h-4" /></ThemedButton>
                        </a>
                    </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </GlassPanel>
    </div>
  );
};

const CopyButton = ({ label, onCopy, isPyriteMode, highlight = false }: { label: string; onCopy: () => void; isPyriteMode: boolean; highlight?: boolean }) => (
  <button 
    onClick={onCopy} 
    className={cn(
        "w-full flex justify-between items-center text-left text-xs p-3 rounded-xl transition-all border group", 
        highlight
            ? (isPyriteMode ? "bg-purple-600 text-white border-purple-500" : "bg-yellow-500 text-black border-yellow-400")
            : (isPyriteMode ? "bg-purple-900/10 hover:bg-purple-900/20 text-purple-200 border-purple-500/20" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/5")
    )}
  >
    <span className="font-bold uppercase tracking-tight opacity-90">{label}</span>
    <Copy className={cn("w-4 h-4 opacity-50 group-hover:opacity-100", highlight ? "text-white/70" : "text-zinc-500")} />
  </button>
);

export default ExportPanel;
