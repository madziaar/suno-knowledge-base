
import React, { memo } from 'react';
import { cn } from '../../../lib/utils';
import { Layers, Mic2, Music, Square } from 'lucide-react';

interface MetaTagToolbarProps {
  onInsert: (tag: string) => void;
  isPyriteMode: boolean;
}

const TAG_GROUPS = [
    {
        label: 'Struct',
        icon: Layers,
        tags: ['[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Outro]']
    },
    {
        label: 'Vocal',
        icon: Mic2,
        tags: ['[Female Vocal]', '[Male Vocal]', '[Whispered]', '[Screaming]', '[Spoken]']
    },
    {
        label: 'Inst',
        icon: Music,
        tags: ['[Guitar Solo]', '[Piano Solo]', '[Instrumental]', '[Drop]', '[Build-up]']
    },
    {
        label: 'End',
        icon: Square,
        tags: ['[Fade Out]', '[End]', '[Instrumental Fade Out][End]']
    }
];

const MetaTagToolbar: React.FC<MetaTagToolbarProps> = memo(({ onInsert, isPyriteMode }) => {
  return (
    <div className="flex overflow-x-auto custom-scrollbar px-2 py-2 gap-4 bg-black/20">
      {TAG_GROUPS.map((group) => (
        <div key={group.label} className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/5 first:border-0 first:pl-0">
          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 select-none">
             <group.icon className="w-3 h-3" />
          </div>
          <div className="flex gap-1">
             {group.tags.map(tag => (
                 <button
                   key={tag}
                   onClick={() => onInsert(tag)}
                   className={cn(
                       "px-2 py-1 rounded text-[10px] font-mono transition-all border whitespace-nowrap",
                       isPyriteMode 
                         ? "bg-purple-900/20 border-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50" 
                         : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                   )}
                   title={`Insert ${tag}`}
                 >
                   {tag}
                 </button>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default MetaTagToolbar;
