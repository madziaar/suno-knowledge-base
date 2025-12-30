
import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { estimateSyllables } from '../utils/syllableCounter';

const CHAR_LIMIT_FOR_ANALYSIS = 3000; // Optimization threshold

export const useSyntaxHighlighter = (value: string, placeholder: string | undefined, isPyriteMode: boolean) => {
  return useMemo(() => {
    const lines = (value || '').split('\n');
    const isLargeText = (value || '').length > CHAR_LIMIT_FOR_ANALYSIS;

    // If empty value, show placeholder structure
    if (!value) return <span className="text-zinc-600 select-none">{placeholder}</span>;
    
    return lines.map((line, lineIdx) => {
        const isStructural = line.trim().startsWith('[') && line.trim().endsWith(']');
        let syllables = 0;
        let isDense = false;
        
        // --- PERFORMANCE OPTIMIZATION ---
        // Only run syllable analysis on smaller texts to prevent freezes
        if (!isLargeText) {
            syllables = estimateSyllables(line);
            isDense = syllables > 16;
        }
        
        // Heatmap color
        let heatColor = 'text-zinc-600';
        if (syllables > 12) heatColor = 'text-yellow-600';
        if (syllables > 16) heatColor = 'text-red-600';
        if (isStructural || isLargeText) heatColor = 'opacity-0'; // Hide count for structural lines or large texts

        // Tokenize line for syntax highlighting
        // Split by brackets [ ] AND parentheses ( )
        const tokens = line.split(/(\[[^\]]+\]|\([^)]+\))/g);

        return (
            <div key={lineIdx} className="min-h-[1.5em] relative flex pr-8 group/line">
                <div className="flex-1">
                    {tokens.map((token, tokenIdx) => {
                        if (token.startsWith('[') && token.endsWith(']')) {
                            return (
                                <span key={tokenIdx} className={`font-bold ${isPyriteMode ? 'text-purple-400' : 'text-yellow-500'}`}>
                                    {token}
                                </span>
                            );
                        } else if (token.startsWith('(') && token.endsWith(')')) {
                            // Parentheses are musical instructions or ad-libs in V4.5
                            return (
                                <span key={tokenIdx} className={`italic ${isPyriteMode ? 'text-pink-400' : 'text-blue-400'}`}>
                                    {token}
                                </span>
                            );
                        }
                        return <span key={tokenIdx} className="text-zinc-300">{token}</span>;
                    })}
                </div>
                
                {/* Syllable Heatmap Badge (Right aligned) */}
                {line.trim().length > 0 && !isStructural && !isLargeText && (
                   <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono select-none ${heatColor} opacity-30 group-hover/line:opacity-100 transition-opacity flex items-center`}>
                      {syllables}
                      {isDense && <AlertCircle className="w-3 h-3 ml-1 text-red-500" />}
                   </span>
                )}
            </div>
        );
    });
  }, [value, isPyriteMode, placeholder]);
};
