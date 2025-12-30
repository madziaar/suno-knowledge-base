
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Terminal, Loader2, Edit3, History, AlertTriangle } from 'lucide-react';
import { ChatMessage, GeneratedPrompt, SongConcept, ExpertInputs } from '../../types';
import { sendChatMessage } from './api';
import { BuilderTranslation } from '../../types';
import GlassPanel from '../../components/shared/GlassPanel';
import { sfx } from '../../lib/audio';

interface PyriteChatProps {
  isPyriteMode: boolean;
  t: BuilderTranslation;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t.chat.welcome,
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

    try {
      const response = await sendChatMessage(
          messages, 
          userMsg.text, 
          isPyriteMode, 
          currentResult,
          inputs,
          expertInputs,
          historySummary,
          validationReport
      );
      
      // Execute Tools
      if (response.toolCalls.length > 0) {
        response.toolCalls.forEach(call => {
          if (call.name === 'update_configuration') {
            // Map 'lyrics' arg to 'lyricsInput' state key if present
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
      }

      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text || (response.toolCalls.length > 0 ? (isPyriteMode ? "Executed." : "Done.") : "Thinking..."),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);
      if (response.toolCalls.length > 0) sfx.play('success');

    } catch (e) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Error connecting to Pyrite Core.",
        timestamp: Date.now(),
        isError: true
      }]);
      sfx.play('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    sfx.play('toggle');
  };

  const themeColor = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';
  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-yellow-500/30';
  const bgColor = isPyriteMode ? 'bg-zinc-950/95' : 'bg-zinc-900/95';

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-24 md:bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${
            isOpen 
            ? 'bg-zinc-800 text-zinc-400 rotate-90' 
            : (isPyriteMode ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] animate-pulse' : 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]')
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-40 md:bottom-24 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] z-50 flex flex-col rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 zoom-in-95 origin-bottom-right ${bgColor} ${borderColor}`}>
          
          {/* Header */}
          <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
             <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isPyriteMode ? 'bg-purple-500/20' : 'bg-yellow-500/20'}`}>
                    <Terminal className={`w-4 h-4 ${themeColor}`} />
                </div>
                <div>
                    <h3 className={`text-sm font-bold ${isPyriteMode ? 'text-purple-100' : 'text-zinc-100'}`}>
                        {isPyriteMode ? t.chat.pyriteTitle : t.chat.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPyriteMode ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`}></span>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">Online</span>
                    </div>
                </div>
             </div>
             
             {/* Context Badges */}
             <div className="flex gap-1">
                <div className="flex items-center text-[10px] text-zinc-400 font-mono gap-1 bg-zinc-800/50 px-2 py-1 rounded border border-white/5" title="Input Connected">
                    <Sparkles className="w-3 h-3" />
                </div>
                {currentResult && (
                    <div className="flex items-center text-[10px] text-green-400 font-mono gap-1 bg-green-900/20 px-2 py-1 rounded border border-green-500/20" title="Result Loaded">
                        <Edit3 className="w-3 h-3" />
                    </div>
                )}
                {historySummary && (
                    <div className="flex items-center text-[10px] text-blue-400 font-mono gap-1 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20" title="History Access">
                        <History className="w-3 h-3" />
                    </div>
                )}
                {validationReport && (
                    <div className="flex items-center text-[10px] text-yellow-400 font-mono gap-1 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20 animate-pulse" title="Validation Issues">
                        <AlertTriangle className="w-3 h-3" />
                    </div>
                )}
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? (isPyriteMode ? 'bg-purple-600 text-white rounded-br-none' : 'bg-zinc-700 text-white rounded-br-none')
                      : (isPyriteMode ? 'bg-purple-900/30 text-purple-100 rounded-bl-none border border-purple-500/20' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-white/5')
                  } ${msg.isError ? 'border-red-500/50 text-red-200 bg-red-900/20' : ''}`}>
                      {msg.text}
                  </div>
               </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                   <div className={`px-4 py-3 rounded-2xl rounded-bl-none ${isPyriteMode ? 'bg-purple-900/10' : 'bg-zinc-800/50'}`}>
                       <div className="flex gap-1">
                           <div className={`w-1.5 h-1.5 rounded-full ${isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                           <div className={`w-1.5 h-1.5 rounded-full ${isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                           <div className={`w-1.5 h-1.5 rounded-full ${isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'} animate-bounce`} style={{ animationDelay: '300ms' }} />
                       </div>
                   </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 border-t ${borderColor} bg-white/5`}>
             <div className="flex gap-2">
                 <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.chat.placeholder}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-600"
                    disabled={isLoading}
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isLoading}
                   className={`p-2.5 rounded-xl transition-all ${
                       !input.trim() || isLoading
                       ? 'bg-zinc-800 text-zinc-600'
                       : (isPyriteMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-yellow-500 text-black hover:bg-yellow-400')
                   }`}
                 >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                 </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PyriteChat;
