
import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { estimateSyllables } from '../utils/syllableCounter';

const CHAR_LIMIT_FOR_ANALYSIS = 1500; // Lowered threshold for mandatory performance
const MAX_LINES_FOR_HEATMAP = 50; // Only show heatmap for reasonable song lengths

export const useSyntaxHighlighter = (value: string, placeholder: string | undefined, isPyriteMode: boolean) => {
  return useMemo(() => {
    if (!value) return <span className="text-zinc-600 select-none">{placeholder}</span>;

    const lines = value.split('\n');
    const isLargeText = value.length > CHAR_LIMIT_FOR_ANALYSIS;
    const tooManyLines = lines.length > MAX_LINES_FOR_HEATMAP;

    return lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="min-h-[1.5em]" />;

        const isStructural = trimmed.startsWith('[') && trimmed.endsWith(']');
        const isInstruction = trimmed.startsWith('(') && trimmed.endsWith(')');
        
        let syllables = 0;
        let isDense = false;
        
        // Skip expensive heuristic for very large inputs to maintain 60fps typing
        if (!isLargeText && !tooManyLines && !isStructural && !isInstruction) {
            syllables = estimateSyllables(line);
            isDense = syllables > 14;
        }
        
        // Heatmap color logic
        let heatColor = 'text-zinc-600';
        if (syllables > 12) heatColor = 'text-yellow-600';
        if (syllables > 16) heatColor = 'text-red-600';

        // Tokenize line: prioritize performance over complex nesting
        const tokens = line.split(/(\[[^\]]+\]|\([^)]+\))/g);

        return (
            <div key={lineIdx} className="min-h-[1.5em] relative flex pr-10 group/line">
                <div className="flex-1">
                    {tokens.map((token, tokenIdx) => {
                        if (!token) return null;
                        if (token.startsWith('[') && token.endsWith(']')) {
                            return (
                                <span key={tokenIdx} className={`font-bold ${isPyriteMode ? 'text-purple-400' : 'text-yellow-500'}`}>
                                    {token}
                                </span>
                            );
                        } else if (token.startsWith('(') && token.endsWith(')')) {
                            return (
                                <span key={tokenIdx} className={`italic ${isPyriteMode ? 'text-pink-400' : 'text-blue-400'}`}>
                                    {token}
                                </span>
                            );
                        }
                        return <span key={tokenIdx} className="text-zinc-300">{token}</span>;
                    })}
                </div>
                
                {/* Syllable Heatmap Badge */}
                {syllables > 0 && (
                   <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono select-none ${heatColor} opacity-20 group-hover/line:opacity-100 transition-opacity flex items-center bg-black/20 px-1 rounded`}>
                      {syllables}
                      {isDense && <AlertCircle className="w-2.5 h-2.5 ml-1 text-red-500 animate-pulse" />}
                   </span>
                )}
            </div>
        );
    });
  }, [value, isPyriteMode, placeholder]);
};
