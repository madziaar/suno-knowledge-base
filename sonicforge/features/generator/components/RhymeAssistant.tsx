
import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { getRhymes } from '../../../services/ai/tools';
import ThemedButton from '../../../components/shared/ThemedButton';

interface RhymeAssistantProps {
  context: string;
  lang: string;
  isPyriteMode: boolean;
  onCopy: (text: string) => void;
}

const RhymeAssistant: React.FC<RhymeAssistantProps> = ({ context, lang, isPyriteMode, onCopy }) => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setRhymes([]);
    try {
      const results = await getRhymes(word, context || "General Song", lang);
      setRhymes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    onCopy(text);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-yellow-500/30';
  const bgColor = isPyriteMode ? 'bg-purple-900/10' : 'bg-yellow-900/10';
  const textColor = isPyriteMode ? 'text-purple-300' : 'text-zinc-300';
  const inputBg = isPyriteMode ? 'bg-black/40 focus:border-purple-500' : 'bg-black/40 focus:border-yellow-500';

  return (
    <div className={`mt-3 p-3 rounded-xl border ${borderColor} ${bgColor} animate-in fade-in slide-in-from-top-2`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-4 h-4 ${isPyriteMode ? 'text-purple-400' : 'text-yellow-500'}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isPyriteMode ? 'text-purple-200' : 'text-zinc-400'}`}>
          AI Rhyme Assistant
        </span>
      </div>

      <div className="flex gap-2">
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder={lang === 'pl' ? "Wpisz słowo..." : "Enter word to rhyme..."}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className={`flex-1 text-xs px-3 py-2 rounded-lg border border-transparent outline-none transition-all ${inputBg} text-white`}
        />
        <ThemedButton 
          onClick={handleSearch} 
          disabled={loading || !word}
          variant={isPyriteMode ? 'pyrite' : 'default'}
          className="px-3 py-1.5 text-xs h-auto"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </ThemedButton>
      </div>

      {rhymes.length > 0 && (
        <div className="mt-3 grid grid-cols-2 xs:grid-cols-3 gap-2">
          {rhymes.map((r, i) => (
            <button
              key={i}
              onClick={() => handleCopy(r, i)}
              className={`text-[10px] md:text-xs text-left px-2 py-1.5 rounded border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group ${textColor}`}
            >
              <span className="truncate mr-2">{r}</span>
              {copiedIndex === i ? (
                 <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
              ) : (
                 <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {!loading && rhymes.length === 0 && word && (
         <div className="mt-2 text-[10px] text-zinc-500 text-center italic">
            Enter a word to find context-aware rhymes.
         </div>
      )}
    </div>
  );
};

export default RhymeAssistant;
