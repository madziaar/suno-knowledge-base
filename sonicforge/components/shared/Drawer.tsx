
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  isPyriteMode?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, isPyriteMode }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Prevent drag if scrolling inside content
    if (target.closest('.drawer-scrollable')) return;
    
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    
    // Rubber-banding logic
    if (deltaY > 0) {
      // Pulling down (Closing) - 1:1 movement
      setCurrentY(deltaY);
    } else {
      // Pulling up (Overshoot) - Logarithmic resistance
      const resistance = 0.3;
      setCurrentY(deltaY * resistance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 150) { // Threshold to close
      onClose();
    }
    setStartY(null);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  const bgClass = isPyriteMode ? 'bg-zinc-950/95 border-purple-500/20' : 'bg-zinc-900/95 border-white/10';
  const textClass = isPyriteMode ? 'text-purple-100' : 'text-zinc-100';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div 
        ref={drawerRef}
        className={cn(
            "relative w-full max-h-[85vh] rounded-t-2xl border-t shadow-2xl flex flex-col transition-transform duration-200 ease-out",
            bgClass,
            isOpen ? "animate-in slide-in-from-bottom duration-300" : ""
        )}
        style={{ transform: `translateY(${currentY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer"}
      >
        {/* Handle Bar Area (Draggable) */}
        <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 rounded-full bg-zinc-700/50" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 shrink-0">
            <h3 className={`font-bold text-lg ${textClass}`}>{title || 'Options'}</h3>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close Drawer"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 pb-safe space-y-6 custom-scrollbar drawer-scrollable overscroll-contain">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
