import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message, ParsedSong } from '../types';
import { CopyButton } from './CopyButton';
import { generateVideoPrompt, parseSongFromText } from '../services/geminiService';
import { useUiSound } from '../hooks/useUiSound';
import {
  Music,
  Download,
  Sliders,
  Film,
  Loader2,
  Zap,
  RefreshCcw,
  Sparkles,
  Hash
} from 'lucide-react';

/* ------------------------------ Components ----------------------------- */

const TagPill: React.FC<{ text: string }> = ({ text }) => (
  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[10px] text-zinc-400 font-mono tracking-tight hover:text-zinc-200 hover:border-white/10 hover:bg-white/[0.06] transition-all cursor-default select-none shadow-sm">
    <Hash size={9} className="opacity-50" />
    {text.replace('#', '')}
  </span>
);

const SongCard: React.FC<{ song: ParsedSong; onRemix: (song: ParsedSong, type: 'lyrics' | 'style' | 'hard') => void }> = ({ song, onRemix }) => {
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'lyrics'>('style');
  const { playClick, playSuccess } = useUiSound();

  const tagsString = song.tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ');
  // Combine Style + Voice + Tags for the copy button
  const fullStylePrompt = `${song.style}, ${song.voice}\n${tagsString}`;

  const handleDownload = useCallback(() => {
    playSuccess();
    const blob = new Blob([
      `Title: ${song.title}\nVoice: ${song.voice}\nTags: ${song.tags.join(', ')}\n\nStyle Prompt:\n${fullStylePrompt}\n\nLyrics:\n${song.lyrics}\n`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [song, fullStylePrompt, playSuccess]);

  const handleGenerateVideo = async () => {
    if (videoPrompt) return;
    playClick();
    setIsVideoLoading(true);
    try {
      const prompt = await generateVideoPrompt(song.title, song.lyrics, song.style);
      if (prompt) {
        setVideoPrompt(prompt);
        playSuccess();
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl animate-pop-in hover:border-white/10 transition-colors duration-500 group">
      
      {/* Header / Meta */}
      <div className="p-5 flex gap-5 items-start bg-white/[0.02] border-b border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000" />

        <div className="relative w-16 h-16 shrink-0 bg-white/[0.03] rounded-xl border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
           <Music size={24} className="text-zinc-600 group-hover:text-indigo-400 transition-colors duration-500" />
        </div>

        <div className="relative flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 group/title">
                <h3 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight group-hover:text-white transition-colors">{song.title}</h3>
                <CopyButton text={song.title} className="opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-indigo-400 mt-0.5 font-mono uppercase tracking-wide opacity-80">{song.voice}</p>
            </div>
            <button onClick={handleDownload} className="text-zinc-600 hover:text-zinc-200 transition-colors p-2 hover:bg-white/5 rounded-lg shrink-0" title="Download .txt">
               <Download size={16} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
             {song.tags.slice(0, 5).map((t, i) => <TagPill key={i} text={t} />)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-5 gap-6">
        <button 
          onClick={() => { playClick(); setActiveTab('style'); }}
          className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'style' ? 'border-zinc-400 text-zinc-100' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
        >
          Style Prompt
        </button>
        <button 
          onClick={() => { playClick(); setActiveTab('lyrics'); }}
          className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'lyrics' ? 'border-zinc-400 text-zinc-100' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
        >
          Lyrics
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 min-h-[160px] relative transition-all duration-300">
        
        {activeTab === 'style' && (
          <div className="space-y-4 animate-fade-in">
             <div className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors group/text relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 opacity-50 group-hover/text:opacity-100 transition-opacity relative z-10">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Prompt String</span>
                      <CopyButton text={fullStylePrompt} label="Copy" />
                  </div>
                  <div className="relative z-10 font-mono leading-relaxed selection:bg-indigo-500/30">
                    <span className="text-[13px] text-zinc-300">{song.style}</span>
                    <span className="text-zinc-500">, </span>
                    <span className="text-[13px] text-indigo-300/90">{song.voice}</span>
                    <div className="text-[11px] text-zinc-500 mt-2">{tagsString}</div>
                  </div>
             </div>

            <div className="pt-2">
               {!videoPrompt ? (
                 <button 
                   onClick={handleGenerateVideo}
                   disabled={isVideoLoading}
                   className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-indigo-400 transition-colors group/video px-2 py-1 -ml-2 rounded hover:bg-white/5"
                 >
                    {isVideoLoading ? <Loader2 size={12} className="animate-spin" /> : <Film size={12} className="group-hover/video:rotate-12 transition-transform" />}
                    {isVideoLoading ? "Generating Video Prompt..." : "Generate AI Video Prompt"}
                 </button>
               ) : (
                 <div className="mt-2 p-4 bg-indigo-500/[0.05] border border-indigo-500/10 rounded-xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex justify-between items-center mb-1 relative z-10">
                      <span className="text-[9px] text-indigo-400/80 font-bold uppercase tracking-wider">Runway/Pika Prompt</span>
                      <CopyButton text={videoPrompt} label="Copy" className="text-indigo-400" />
                    </div>
                    <p className="text-[12px] text-indigo-200/80 font-mono leading-relaxed relative z-10">{videoPrompt}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-end mb-3">
                <span className="text-[9px] font-bold text-zinc-600 uppercase">Structure View</span>
                <CopyButton text={song.lyrics} label="Copy All" />
             </div>
             <pre className="font-sans text-[14px] text-zinc-300 whitespace-pre-wrap leading-8 pl-4 border-l-2 border-white/10">{song.lyrics}</pre>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/5 p-2.5 flex gap-2 justify-end bg-white/[0.02]">
         <button onClick={() => { playClick(); onRemix(song, 'lyrics'); }} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-white/5 transition-colors active:scale-95">
           <RefreshCcw size={12} /> Remix Lyrics
         </button>
         <button onClick={() => { playClick(); onRemix(song, 'style'); }} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-white/5 transition-colors active:scale-95">
           <Sliders size={12} /> Remix Style
         </button>
         <button onClick={() => { playSuccess(); onRemix(song, 'hard'); }} className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-200 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/10 hover:border-indigo-500/20 transition-all active:scale-95 shadow-sm">
           <Zap size={12} /> Hard Remix
         </button>
      </div>

    </div>
  );
};

/* ------------------------------- Main List ------------------------------- */

export const MessageList: React.FC<{
  messages: Message[];
  isLoading: boolean;
  onRemix: (song: ParsedSong, type: 'lyrics' | 'style' | 'hard') => void;
}> = ({ messages, isLoading, onRemix }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar scroll-smooth p-4 pb-0">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const song = !isUser ? parseSongFromText(msg.content) : null;

          if (!isUser && !msg.content && !song) return null;

          const displayContent = isUser 
             ? msg.content.replace(/\[CONSTRAINT:.*?\]/g, '').replace(/\n=== STUDIO SETTINGS ===[\s\S]*/, '') 
             : msg.content.split('## Title:')[0].trim();

          if (!isUser && !song && !displayContent) return null;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isUser ? 'animate-slide-up' : 'animate-fade-in'}`}>
              
              {/* Text Bubble */}
              {(isUser || (!song && displayContent)) && (
                <div className={`
                  relative px-6 py-4 max-w-[90%] md:max-w-[80%] text-[15px] leading-relaxed transition-transform duration-300
                  ${isUser 
                    ? 'bg-white/10 backdrop-blur-md border border-white/5 text-zinc-100 rounded-2xl rounded-tr-sm hover:scale-[1.01] shadow-lg' 
                    : 'text-zinc-400 bg-transparent px-2' 
                  }
                `}>
                   {displayContent}
                </div>
              )}

              {/* Song Embed */}
              {song && !isUser && <SongCard song={song} onRemix={onRemix} />}
            </div>
          );
        })}

        {isLoading && (
          <div className="ml-6 mt-4 max-w-[140px] animate-fade-in">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
               <div className="h-full bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent w-full animate-shimmer" />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 font-mono tracking-widest animate-pulse">GENERATING...</div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" /> {/* Spacer */}
      </div>
    </div>
  );
};