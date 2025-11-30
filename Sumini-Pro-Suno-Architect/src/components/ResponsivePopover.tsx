import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ResponsivePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  className?: string;
}

export const ResponsivePopover: React.FC<ResponsivePopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = '',
}) => {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, pointerEvents: 'none' });
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // 1. Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Keyboard & Interaction Handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Lock body scroll on mobile only when open
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isMobile]);

  // 3. Smart Positioning Engine
  useLayoutEffect(() => {
    if (!isOpen) return;

    if (isMobile) {
      setStyle({}); 
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !popupRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const margin = 12;
      const padding = 20;

      let top = 0;
      let left = 0;
      
      const spaceRight = viewportW - triggerRect.right;
      const spaceLeft = triggerRect.left;
      const spaceBottom = viewportH - triggerRect.bottom;

      // 1. Try RIGHT
      if (spaceRight >= popupRect.width + margin) {
        left = triggerRect.right + margin;
        top = triggerRect.top + (triggerRect.height / 2) - (popupRect.height / 2);
      } 
      // 2. Try LEFT
      else if (spaceLeft >= popupRect.width + margin) {
        left = triggerRect.left - popupRect.width - margin;
        top = triggerRect.top + (triggerRect.height / 2) - (popupRect.height / 2);
      }
      // 3. Try BOTTOM
      else if (spaceBottom >= popupRect.height + margin) {
        left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
        top = triggerRect.bottom + margin;
      }
      // 4. Fallback TOP
      else {
        left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
        top = triggerRect.top - popupRect.height - margin;
      }

      // 5. Clamping
      if (left < padding) left = padding;
      if (left + popupRect.width > viewportW - padding) {
        left = viewportW - popupRect.width - padding;
      }

      if (top < padding) top = padding;
      if (top + popupRect.height > viewportH - padding) {
        top = viewportH - popupRect.height - padding;
      }

      setStyle({
        position: 'fixed',
        top,
        left,
        margin: 0,
        opacity: 1,
        pointerEvents: 'auto',
        zIndex: 100,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={popupRef}
        style={style}
        onClick={(e) => e.stopPropagation()}
        className={
          isMobile
            ? `fixed bottom-0 left-0 w-full z-[100] bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-slide-up max-h-[80vh] overflow-y-auto pb-safe ${className}`
            : `fixed z-[100] w-full max-w-sm glass-panel rounded-2xl p-5 animate-pop-in shadow-[0_10px_40px_rgba(0,0,0,0.3)] ${className}`
        }
      >
        {isMobile && <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />}
        {children}
      </div>
    </>,
    document.body
  );
};