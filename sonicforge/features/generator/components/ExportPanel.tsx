
import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Copy, Share2, QrCode, Twitter, Mail } from 'lucide-react';
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
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <Share2 className="w-4 h-4" />
            {te.title}
          </h3>
          <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Download & Copy */}
          <div className="space-y-6">
            {/* Download */}
            <section>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{te.download}</h4>
              <div className="grid grid-cols-3 gap-2">
                <ThemedButton onClick={() => { exportAsTextFile(exportAsSunoText(result), `${result.title}.txt`); showToast(toast.downloaded, 'success'); }} variant="zinc" className="text-xs py-3">{t.output.exportSuno}</ThemedButton>
                <ThemedButton onClick={() => { exportAsJSON({ inputs, result, timestamp: Date.now() }, `${result.title}.json`); showToast(toast.downloaded, 'success'); }} variant="zinc" className="text-xs py-3">{t.output.exportJson}</ThemedButton>
                <ThemedButton onClick={() => { exportAsMarkdown({ inputs, result, timestamp: Date.now() }, `${result.title}.md`); showToast(toast.downloaded, 'success'); }} variant="zinc" className="text-xs py-3">{t.output.exportMd}</ThemedButton>
              </div>
            </section>

            {/* Copy */}
            <section>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{te.copy}</h4>
              <div className="space-y-2">
                <CopyButton label={t.output.titleLabel} onCopy={() => handleCopy(result.title, t.output.titleLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.tagsLabel} onCopy={() => handleCopy(result.tags, t.output.tagsLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.styleDescLabel} onCopy={() => handleCopy(result.style, t.output.styleDescLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={t.output.lyricsLabel} onCopy={() => handleCopy(result.lyrics, t.output.lyricsLabel)} isPyriteMode={isPyriteMode} />
                <CopyButton label={te.fullSuno} onCopy={() => handleCopy(exportAsSunoText(result), te.fullSuno)} isPyriteMode={isPyriteMode} />
              </div>
            </section>
          </div>

          {/* Right Column: Share */}
          <section>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{te.share}</h4>
            <div className={cn("p-4 rounded-xl border flex flex-col items-center", isPyriteMode ? "bg-purple-900/10 border-purple-500/20" : "bg-zinc-800 border-zinc-700")}>
              <p className="text-[10px] text-zinc-500 mb-3 text-center uppercase tracking-wider">{te.qrCode}</p>
              {shareUrl ? (
                <div className="p-2 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR Code"
                    width={128}
                    height={128}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-zinc-700 animate-pulse rounded-lg" />
              )}
              <div className="w-full mt-4">
                <ThemedButton onClick={() => handleCopy(shareUrl, 'Link')} variant="outline" className="w-full text-xs py-2">
                  {te.copyLink}
                </ThemedButton>
                <div className="flex items-center gap-2 mt-3">
                  <a href={socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <ThemedButton variant="zinc" className="w-full text-xs py-2"><Twitter className="w-3.5 h-3.5" /></ThemedButton>
                  </a>
                  <a href={socialLinks?.reddit} target="_blank" rel="noopener noreferrer" className="flex-1">
                     <ThemedButton variant="zinc" className="w-full text-xs py-2">Reddit</ThemedButton>
                  </a>
                   <a href={socialLinks?.email} className="flex-1">
                     <ThemedButton variant="zinc" className="w-full text-xs py-2"><Mail className="w-3.5 h-3.5" /></ThemedButton>
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </GlassPanel>
    </div>
  );
};

const CopyButton = ({ label, onCopy, isPyriteMode }: { label: string; onCopy: () => void; isPyriteMode: boolean; }) => (
  <button onClick={onCopy} className={cn("w-full flex justify-between items-center text-left text-xs p-2 rounded-lg transition-colors", isPyriteMode ? "bg-purple-900/10 hover:bg-purple-900/20 text-purple-200" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300")}>
    <span>{label}</span>
    <Copy className="w-3.5 h-3.5 text-zinc-500" />
  </button>
);

export default ExportPanel;
