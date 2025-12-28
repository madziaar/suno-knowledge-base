
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  items: ContextMenuItem[];
  isPyriteMode: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ position, onClose, items, isPyriteMode }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (position) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKeyDown);
      // Disable default context menu if clicking inside our menu
      document.addEventListener('contextmenu', (e) => {
          if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
              onClose();
          } else {
              e.preventDefault();
          }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', onClose);
    };
  }, [position, onClose]);

  if (!position) return null;

  // Adjust position to keep within viewport
  const x = Math.min(position.x, window.innerWidth - 200);
  const y = Math.min(position.y, window.innerHeight - (items.length * 40));

  const bgClass = isPyriteMode 
    ? 'bg-zinc-950/95 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]' 
    : 'bg-zinc-900/95 border-white/10 shadow-2xl';

  return createPortal(
    <AnimatePresence>
      {position && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "fixed z-[9999] min-w-[180px] rounded-xl border backdrop-blur-xl overflow-hidden py-1.5 flex flex-col",
            bgClass
          )}
          style={{ top: y, left: x }}
        >
          {items.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors w-full text-left",
                item.danger 
                  ? "text-red-400 hover:bg-red-900/20" 
                  : (isPyriteMode ? "text-purple-100 hover:bg-purple-500/20" : "text-zinc-200 hover:bg-white/10")
              )}
              whileHover={{ x: 2 }}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{item.icon}</span>}
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ContextMenu;
