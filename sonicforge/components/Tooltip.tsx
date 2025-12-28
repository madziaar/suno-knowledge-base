
import React, { useState, memo } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = memo(({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1.5 align-middle group z-20">
      <button
        type="button"
        className="text-zinc-600 hover:text-yellow-500 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-label="Info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-60 p-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] text-xs text-zinc-300 leading-relaxed font-normal normal-case z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          {content}
          <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-zinc-900/95 border-b border-r border-zinc-700 transform rotate-45 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
});

export default Tooltip;
