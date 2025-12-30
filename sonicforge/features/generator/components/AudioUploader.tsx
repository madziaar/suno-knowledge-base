
import React, { useCallback, useState } from 'react';
import { Upload, X, Music, AlertTriangle, Loader2, ScanEye, MicVocal, Guitar } from 'lucide-react';
import { BuilderTranslation } from '../../../types';
import ThemedButton from '../../../components/shared/ThemedButton';
import { cn } from '../../../lib/utils';
import { useSettings } from '../../../contexts/SettingsContext';
import { translations } from '../../../translations';

interface AudioUploaderProps {
  onAudioSelected: (base64: string, mimeType: string) => void;
  onClear: () => void;
  isAnalyzing: boolean;
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

type UploadMode = 'analyze' | 'addVocals' | 'addInstrumentals';

// INLINED WORKER CODE TO PREVENT URL RESOLUTION ERRORS
const AUDIO_WORKER_CODE = `
self.onmessage = (e) => {
  const { buffer, type } = e.data;

  try {
    // Efficiently convert ArrayBuffer to Base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    // Chunking to avoid stack overflow on large files
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    
    const base64 = btoa(binary);
    self.postMessage({ success: true, base64, type });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
`;

const AudioUploader: React.FC<AudioUploaderProps> = React.memo(({ 
  onAudioSelected, 
  onClear, 
  isAnalyzing, 
  t, 
  isPyriteMode 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<UploadMode>('analyze');
  
  const { lang } = useSettings();
  const tErrors = translations[lang].errors;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateDuration = (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
          const audio = document.createElement('audio');
          audio.preload = 'metadata';
          audio.onloadedmetadata = () => {
              window.URL.revokeObjectURL(audio.src);
              // V4.5 supports up to 8 minutes (480s), allow up to 10m buffer for upload
              if (audio.duration > 600) { 
                  resolve(false);
              } else {
                  resolve(true);
              }
          };
          audio.onerror = () => resolve(false); // Fail safe
          audio.src = window.URL.createObjectURL(file);
      });
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    
    // Size check (10MB limit is usually client-side constraint for processing)
    if (file.size > 10 * 1024 * 1024) {
      setError(tErrors.fileTooLarge);
      setIsProcessing(false);
      return;
    }

    // Type check
    if (!file.type.startsWith('audio/')) {
        setError(tErrors.invalidFormat);
        setIsProcessing(false);
        return;
    }

    // Duration Check (Phase 4.1)
    const isValidDuration = await validateDuration(file);
    if (!isValidDuration) {
        setError(tErrors.audioTooLong);
        setIsProcessing(false);
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        
        // Use Blob for Worker to avoid URL resolution issues
        const blob = new Blob([AUDIO_WORKER_CODE], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = (msg) => {
            if (msg.data.success) {
                setFileName(file.name);
                if (mode === 'analyze') {
                  onAudioSelected(msg.data.base64, file.type);
                }
            } else {
                setError(tErrors.processingFailed);
            }
            setIsProcessing(false);
            worker.terminate();
            URL.revokeObjectURL(worker.onerror as any); // Cleanup (approximate)
        };

        worker.onerror = () => {
            setError(tErrors.workerError);
            setIsProcessing(false);
            worker.terminate();
        };

        // Transfer buffer to worker
        worker.postMessage({ buffer, type: file.type }, [buffer]);
    };

    reader.onerror = () => {
        setError(tErrors.readFailed);
        setIsProcessing(false);
    };

    // Read as ArrayBuffer (faster than DataURL on main thread)
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setError(null);
    onClear();
  };
  
  const MODES: { id: UploadMode; icon: React.ElementType; label: string }[] = [
    { id: 'analyze', icon: ScanEye, label: t.audio.uploadModes.analyze },
    { id: 'addVocals', icon: MicVocal, label: t.audio.uploadModes.addVocals },
    { id: 'addInstrumentals', icon: Guitar, label: t.audio.uploadModes.addInstrumentals },
  ];
  const dropLabel = t.audio.dropLabels[mode] || t.audio.dropLabel;

  // Styles
  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-blue-500/30';
  const activeBorder = isPyriteMode ? 'border-purple-500' : 'border-blue-500';
  const bgActive = isPyriteMode ? 'bg-purple-500/10' : 'bg-blue-500/10';

  if (fileName) {
      return (
          <div className={`p-4 rounded-xl border ${borderColor} bg-black/20 animate-in fade-in`}>
              <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${isPyriteMode ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          <Music className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-300 truncate max-w-[200px]">{fileName}</p>
                          <p className="text-[10px] text-zinc-500 uppercase">{isAnalyzing ? t.audio?.analyzing : t.audio.ready}</p>
                      </div>
                  </div>
                  <button onClick={handleRemove} disabled={isAnalyzing} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                      <X className="w-4 h-4" />
                  </button>
              </div>
              
              {isAnalyzing && (
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${isPyriteMode ? 'bg-purple-500' : 'bg-blue-500'} animate-progress`} style={{ width: '100%' }}></div>
                      <style>{`
                          @keyframes progress {
                              0% { width: 0%; transform: translateX(-100%); }
                              100% { width: 100%; transform: translateX(0%); }
                          }
                          .animate-progress {
                              animation: progress 2s infinite linear;
                          }
                      `}</style>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.audio.title}</h4>
        
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-800 border border-zinc-700">
            {MODES.map(m => (
                <button 
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn("px-2 py-1.5 text-[10px] font-bold rounded capitalize transition-colors flex items-center justify-center gap-1.5", 
                        mode === m.id 
                            ? (isPyriteMode ? 'bg-purple-600 text-white' : 'bg-zinc-600 text-white') 
                            : 'text-zinc-400 hover:bg-zinc-700'
                    )}
                >
                    <m.icon className="w-3 h-3" />
                    {m.label}
                </button>
            ))}
        </div>
        
        {/* Drop Zone */}
        <div 
          className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-200 text-center p-6 ${dragActive ? `${activeBorder} ${bgActive}` : `border-zinc-800 hover:border-zinc-700 bg-zinc-900/30`}`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept="audio/mp3,audio/wav,audio/mpeg"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isAnalyzing || isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center pointer-events-none">
             <div className={`p-3 rounded-full mb-3 ${isPyriteMode ? 'bg-purple-900/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
             </div>
             <p className="text-sm font-bold text-zinc-300 mb-1">{isProcessing ? t.audio.processing : dropLabel}</p>
             <p className="text-xs text-zinc-500">{t.audio.limits}</p>
          </div>

          {error && (
              <div className="absolute bottom-2 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-[10px] text-red-400 font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/30 flex items-center justify-center inline-flex">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {error}
                  </span>
              </div>
          )}
        </div>
    </div>
  );
});

export default AudioUploader;
