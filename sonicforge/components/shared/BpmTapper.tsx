
import React, { useState, useEffect, memo } from 'react';
import { Activity, RefreshCcw } from 'lucide-react';

interface BpmTapperProps {
  onBpmChange: (bpm: string) => void;
  variant?: 'default' | 'pyrite';
}

const BpmTapper: React.FC<BpmTapperProps> = ({ onBpmChange, variant = 'default' }) => {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleTap = () => {
    const now = Date.now();
    const newTaps = [...taps, now].filter(t => now - t < 3000); // Keep taps within last 3 seconds
    setTaps(newTaps);

    if (newTaps.length > 1) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      setBpm(calculatedBpm);
      onBpmChange(calculatedBpm.toString());
    }
  };

  const reset = () => {
    setTaps([]);
    setBpm(null);
  };

  const isPyrite = variant === 'pyrite';
  const btnClass = isPyrite 
    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300';
    
  const activeClass = taps.length > 0
    ? (isPyrite ? 'scale-95 bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]' : 'scale-95 bg-yellow-500 text-black')
    : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded hover:bg-zinc-800 transition-colors ${isPyrite ? 'text-purple-400 hover:text-purple-300' : 'text-zinc-500 hover:text-zinc-300'}`}
        title="BPM Tapper"
      >
        <Activity className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={`absolute bottom-full right-0 mb-2 w-48 p-4 rounded-xl border backdrop-blur-md shadow-xl z-50 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 ${
            isPyrite ? 'bg-purple-950/90 border-purple-500/30' : 'bg-zinc-900/95 border-zinc-700'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold font-mono ${isPyrite ? 'text-purple-200' : 'text-white'}`}>
                {bpm || '--'} <span className="text-xs text-zinc-500">BPM</span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tap to the beat</p>
          </div>

          <button
            type="button"
            onMouseDown={handleTap}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-75 border border-white/10 ${btnClass} ${activeClass}`}
          >
            <Activity className="w-6 h-6" />
          </button>

          <button 
            type="button" 
            onClick={reset}
            className="text-[10px] flex items-center text-zinc-500 hover:text-zinc-300"
          >
            <RefreshCcw className="w-3 h-3 mr-1" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(BpmTapper);