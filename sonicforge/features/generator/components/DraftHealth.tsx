
import React, { memo } from 'react';
import { Activity, AlertTriangle, Lightbulb, Info, Zap } from 'lucide-react';
import { usePromptScore } from '../hooks/usePromptScore';
import { cn } from '../../../lib/utils';
import { sfx } from '../../../lib/audio';
import { motion } from 'framer-motion';
import { useSettings } from '../../../contexts/SettingsContext';
import { translations } from '../../../translations';

interface DraftHealthProps {
  isPyriteMode: boolean;
  onOptimize?: () => void;
  isLoading?: boolean;
}

const pyriteTranslate = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('genre')) return "Darling, we can't build on void. Pick a Genre.";
    if (lower.includes('mood')) return "The emotional spectrum is flat. Give me a Mood.";
    if (lower.includes('vocal')) return "Who's singing this? Me? Then specify 'Female Vocals'.";
    if (lower.includes('bpm')) return "It has no heartbeat. Set the BPM.";
    if (lower.includes('short')) return "Is that it? Dig deeper, honey. More details.";
    if (lower.includes('long')) return "You're rambling. Tighten it up.";
    if (lower.includes('ending')) return "Don't leave them hanging. Add an [End] tag.";
    if (lower.includes('conflict')) return "You're contradicting yourself. Pick a lane.";
    return msg;
};

const RadialGauge = ({ value, max, label, color, size = 60, stroke = 4 }: { value: number, max: number, label: string, color: string, size?: number, stroke?: number }) => {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / max) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        className="text-white/5"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={color}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold opacity-60">{value}</span>
                </div>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40">{label}</span>
        </div>
    );
};

const DraftHealth: React.FC<DraftHealthProps> = memo(({ isPyriteMode, onOptimize, isLoading }) => {
  const validation = usePromptScore();
  const { lang } = useSettings();
  const t = translations[lang].builder.health;

  let scoreColor = 'text-zinc-500';
  let borderColor = 'border-zinc-800';
  let glowColor = '';
  
  if (validation.status === 'optimal') {
      scoreColor = isPyriteMode ? 'text-green-400' : 'text-green-600';
      borderColor = isPyriteMode ? 'border-green-500/30' : 'border-green-500/20';
      glowColor = isPyriteMode ? 'shadow-[0_0_20px_rgba(74,222,128,0.1)]' : '';
  } else if (validation.status === 'good') {
      scoreColor = isPyriteMode ? 'text-blue-400' : 'text-blue-600';
      borderColor = isPyriteMode ? 'border-blue-500/30' : 'border-blue-500/20';
  } else if (validation.status === 'warning') {
      scoreColor = isPyriteMode ? 'text-yellow-400' : 'text-yellow-600';
      borderColor = isPyriteMode ? 'border-yellow-500/30' : 'border-yellow-500/20';
  } else {
      scoreColor = isPyriteMode ? 'text-red-400' : 'text-red-600';
      borderColor = isPyriteMode ? 'border-red-500/30' : 'border-red-500/20';
  }

  const bgClass = isPyriteMode ? 'bg-black/30' : 'bg-white/5';
  
  const displayConflicts = isPyriteMode ? validation.conflicts.map(pyriteTranslate) : validation.conflicts;
  const displayIssues = isPyriteMode ? validation.issues.map(pyriteTranslate) : validation.issues;
  const displaySuggestions = isPyriteMode ? validation.suggestions.map(pyriteTranslate) : validation.suggestions;

  return (
    <div className={cn("rounded-xl border p-4 transition-all duration-300 flex flex-col gap-6", borderColor, bgClass, glowColor)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Activity className={cn("w-4 h-4", scoreColor)} />
            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest", isPyriteMode ? "text-zinc-300" : "text-zinc-600")}>
                {t.title}
            </h4>
        </div>
        <div className="flex items-center gap-2">
            <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-black border", scoreColor, borderColor)}>
                {t.gradeLabel}: {validation.grade}
            </div>
            <span className={cn("text-xl font-black font-mono", scoreColor)}>
                {validation.totalScore}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
          <RadialGauge value={validation.breakdown.completeness} max={30} label="CMP" color="text-blue-400" />
          <RadialGauge value={validation.breakdown.specificity} max={30} label="SPC" color="text-purple-400" />
          <RadialGauge value={validation.breakdown.balance} max={20} label="BAL" color="text-green-400" />
          <RadialGauge value={validation.breakdown.coherence} max={20} label="COH" color="text-yellow-400" />
      </div>

      <div className="space-y-2 min-h-[60px]">
          {displayConflicts.slice(0, 1).map((conflict, i) => (
              <div key={`conflict-${i}`} className="flex items-start gap-2 text-[10px] text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20 animate-in fade-in zoom-in-95">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{conflict}</span>
              </div>
          ))}
          {displayIssues.slice(0, 2).map((issue, i) => (
              <div key={`issue-${i}`} className="flex items-start gap-2 text-[10px] text-zinc-400 pl-1 animate-in fade-in slide-in-from-left-2">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-zinc-500" />
                  <span>{issue}</span>
              </div>
          ))}
          {displaySuggestions.slice(0, 2).map((suggestion, i) => (
              <div key={`suggestion-${i}`} className={cn("flex items-start gap-2 text-[10px] pl-1 animate-in fade-in slide-in-from-left-2", isPyriteMode ? "text-purple-300" : "text-blue-500")}>
                  <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
              </div>
          ))}
      </div>

      {onOptimize && (
          <button 
            onClick={() => { sfx.play('click'); onOptimize(); }}
            disabled={isLoading}
            className={cn(
                "w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all group",
                isPyriteMode 
                    ? "bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
          >
              {isLoading ? (
                  <Activity className="w-3.5 h-3.5 animate-spin" />
              ) : (
                  <Zap className="w-3.5 h-3.5 group-hover:fill-current transition-all" />
              )}
              {t.autoImprove}
          </button>
      )}
    </div>
  );
});

export default DraftHealth;
