
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Terminal, Loader2, Edit3, History, AlertTriangle, Volume2, VolumeX, Ghost, Trash2 } from 'lucide-react';
import { ChatMessage, GeneratedPrompt, SongConcept, ExpertInputs, DialogTranslation } from '../../types';
import { sendChatMessage } from './api';
import { BuilderTranslation } from '../../types';
import GlassPanel from '../../components/shared/GlassPanel';
import { sfx } from '../../lib/audio';
import { useAudio } from '../../contexts/AudioContext';
import { useSettingsState } from '../../contexts/SettingsContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PyriteChatProps {
  isPyriteMode: boolean;
  t: BuilderTranslation;
  tDialog?: DialogTranslation;
  onUpdateConfig: (config: any) => void;
  onReset: () => void;
  onMutate: (field: string, content: string) => void;
  onLoadHistory: (index: number) => void;
  onAutoFixRiffusion: () => void;
  currentResult: GeneratedPrompt | null;
  historySummary: string;
  validationReport: string;
  inputs: SongConcept;
  expertInputs: ExpertInputs;
}

const PyriteChat: React.FC<PyriteChatProps> = ({ 
  isPyriteMode, 
  t, 
  tDialog,
  onUpdateConfig, 
  onReset, 
  onMutate, 
  onLoadHistory,
  onAutoFixRiffusion,
  currentResult,
  historySummary,
  validationReport,
  inputs,
  expertInputs
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isMuted, toggleMute } = useAudio();
  const { lang } = useSettingsState(); // Get global lang
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: isPyriteMode ? t?.chat?.welcome || "Ready." : "Connection established. How can I assist with your prompt architecture today?",
      timestamp: Date.now()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    sfx.play('click');

    const tempId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'model',
      text: "...",
      timestamp: Date.now()
    }]);

    try {
      const response = await sendChatMessage(
          messages, 
          userMsg.text, 
          isPyriteMode, 
          currentResult,
          inputs,
          expertInputs,
          historySummary,
          validationReport,
          lang, // Pass language explicitly to API
          (chunkText) => {
              setMessages(prev => prev.map(msg => 
                  msg.id === tempId ? { ...msg, text: chunkText } : msg
              ));
          }
      );
      
      if (response.toolCalls.length > 0) {
        response.toolCalls.forEach(call => {
          if (call.name === 'update_configuration') {
            const args = { ...call.args };
            if (args.lyrics) {
                args.lyricsInput = args.lyrics;
                delete args.lyrics;
            }
            onUpdateConfig(args);
          } else if (call.name === 'reset_form') {
            onReset();
          } else if (call.name === 'mutate_result') {
            onMutate(call.args.field, call.args.content);
          } else if (call.name === 'load_history') {
            onLoadHistory(call.args.index);
          } else if (call.name === 'apply_riffusion_fix') {
            onAutoFixRiffusion();
          }
        });
        sfx.play('success');
      }

      setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, text: response.text || (response.toolCalls.length > 0 ? "Modifications applied." : "...") } : msg
      ));

    } catch (e) {
      setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, text: "The connection to the neural core was interrupted.", isError: true } : msg
      ));
      sfx.play('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    sfx.play('toggle');
  };

  const clearChat = () => {
      const msg = tDialog?.resetWorkflow || "Reset history?";
      if (window.confirm(msg)) {
          setMessages([{
              id: crypto.randomUUID(),
              role: 'model',
              text: isPyriteMode ? "Memory purged. Fresh start, darling." : "History cleared.",
              timestamp: Date.now()
          }]);
          sfx.play('click');
      }
  };

  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-yellow-500/30';
  const bgColor = isPyriteMode ? 'bg-zinc-950/95' : 'bg-zinc-900/95';

  return (
    <>
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
            "fixed bottom-28 md:bottom-6 right-6 z-[60] p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-center justify-center border",
            isOpen 
            ? 'bg-zinc-800 text-zinc-400 border-white/10' 
            : (isPyriteMode ? 'bg-purple-600 text-white border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.5)]' : 'bg-yellow-500 text-black border-yellow-600/50')
        )}
      >
        <AnimatePresence mode="wait">
            {isOpen ? (
                <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <X className="w-6 h-6" />
                </motion.div>
            ) : (
                <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}>
                    <Ghost className="w-6 h-6" />
                </motion.div>
            )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95, transformOrigin: 'bottom right' }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className={cn(
                    "fixed bottom-44 md:bottom-24 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[420px] h-[550px] max-h-[70vh] md:max-h-[75vh] z-[60] flex flex-col rounded-3xl border backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden",
                    bgColor, borderColor
                )}
            >
                <div className={cn("p-5 border-b flex items-center justify-between bg-black/40", borderColor)}>
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-2xl border bg-gradient-to-br", isPyriteMode ? "from-purple-600/20 to-pink-600/20 border-purple-500/30" : "from-yellow-500/20 to-orange-500/20 border-yellow-500/30")}>
                            <Logo className={cn("w-5 h-5", isPyriteMode ? "text-purple-400" : "text-yellow-500")} isPyriteMode={isPyriteMode} />
                        </div>
                        <div>
                            <h3 className={cn("text-sm md:text-base font-bold tracking-tight", isPyriteMode ? "text-purple-100" : "text-zinc-100")}>
                                {isPyriteMode ? "Pyrite Alpha" : "Neural Assistant"}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPyriteMode ? "bg-purple-500 shadow-[0_0_8px_#a855f7]" : "bg-green-500 shadow-[0_0_8px_#22c55e]")}></span>
                                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-1">
                        <button onClick={clearChat} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-red-400 transition-colors" title="Clear Chat">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={toggleMute} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-black/10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? 'items-end' : 'items-start')}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm shadow-sm transition-all relative group",
                                msg.role === 'user' 
                                    ? (isPyriteMode ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-zinc-700 text-white rounded-tr-none')
                                    : (isPyriteMode ? 'bg-purple-900/20 text-purple-100 rounded-tl-none border border-purple-500/20' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'),
                                msg.isError && 'border-red-500/50 text-red-200 bg-red-950/40'
                            )}>
                                {msg.text === '...' ? (
                                    <div className="flex gap-1.5 p-1">
                                        {[0, 150, 300].map((delay) => (
                                            <motion.div 
                                                key={delay}
                                                initial={{ scale: 0.8, opacity: 0.3 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ repeat: Infinity, duration: 0.6, repeatType: 'reverse', delay: delay / 1000 }}
                                                className={cn("w-1.5 h-1.5 rounded-full", isPyriteMode ? "bg-purple-400" : "bg-yellow-500")} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <span className="whitespace-pre-wrap">{msg.text}</span>
                                )}
                            </div>
                            <span className="text-[9px] text-zinc-600 mt-1 font-mono uppercase tracking-tighter mx-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className={cn("p-4 border-t bg-black/40", borderColor)}>
                    <div className="flex gap-2 relative">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isPyriteMode ? (lang === 'pl' ? "Szepnij mi coś, Kochanie..." : "Whisper to me, Darling...") : (lang === 'pl' ? "Wprowadź polecenie..." : "Request a modification...")}
                            className={cn(
                                "flex-1 bg-black/60 border rounded-2xl px-5 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600",
                                isPyriteMode ? "border-purple-500/20 focus:border-purple-500/40" : "border-white/10 focus:border-white/20"
                            )}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "p-3 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale disabled:active:scale-100",
                                isPyriteMode ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-yellow-500 text-black hover:bg-yellow-400"
                            )}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    {isPyriteMode && (
                        <p className="text-[9px] text-zinc-700 text-center mt-3 uppercase font-bold tracking-[0.2em] pointer-events-none">
                            Aleph Null Sovereign Intelligence
                        </p>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Logo: React.FC<{ className?: string, isPyriteMode?: boolean }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default PyriteChat;
