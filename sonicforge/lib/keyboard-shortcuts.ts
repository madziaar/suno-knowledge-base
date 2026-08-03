
import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // For Mac Cmd
  altKey?: boolean;
  shiftKey?: boolean;
  handler: KeyHandler;
  allowInInput?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Identify if user is typing in a text field
      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      shortcuts.forEach(config => {
        const keyMatch = e.key.toLowerCase() === config.key.toLowerCase();
        
        // Modifiers check
        const hasCtrl = config.ctrlKey ? (e.ctrlKey || e.metaKey) : false; // Support both for cross-platform
        // If ctrlKey is explicitly strictly required, we might need stricter logic, but this usually suffices
        
        if (keyMatch && (config.ctrlKey ? hasCtrl : true)) {
          // If we are in an input and this shortcut is not allowed in input, skip
          // Exception: Ctrl+Enter often desired in textarea
          if (isInput && !config.allowInInput) return;
          
          e.preventDefault();
          config.handler(e);
          // console.debug(`Shortcut triggered: ${config.ctrlKey ? 'Ctrl+' : ''}${config.key}`);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
