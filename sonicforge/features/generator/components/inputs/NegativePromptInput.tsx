import React, { memo } from 'react';
import { MinusCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import Tooltip from '../../../../components/Tooltip';
import { BuilderTranslation } from '../../../../types';

interface NegativePromptInputProps {
  value: string;
  onChange: (value: string) => void;
  isPyriteMode: boolean;
  t: BuilderTranslation;
}

const NegativePromptInput: React.FC<NegativePromptInputProps> = memo(({ value, onChange, isPyriteMode, t }) => {
  const summaryClass = cn(
    "flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider transition-colors list-none",
    isPyriteMode ? 'text-purple-400/70 hover:text-purple-300' : 'text-zinc-500 hover:text-zinc-300'
  );

  const textareaClass = cn(
    "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-zinc-300 outline-none h-20 resize-y text-sm mt-2 placeholder:text-zinc-600",
    "focus:border-transparent focus:ring-1",
    isPyriteMode ? 'focus:ring-purple-500' : 'focus:ring-yellow-500'
  );

  return (
    <details className="group">
      <summary className={summaryClass}>
        <MinusCircle className="w-4 h-4" />
        Negative Prompt (Optional)
        <Tooltip content={t.tooltips.negativePrompt} />
        <span className="text-zinc-600 text-[10px] ml-auto opacity-0 group-open:opacity-100 transition-opacity">
          (e.g., no guitar, avoid clichés about rain)
        </span>
      </summary>
      <div className="mt-2 animate-in fade-in slide-in-from-top-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="List elements or themes to exclude..."
          className={textareaClass}
        />
      </div>
    </details>
  );
});

export default NegativePromptInput;