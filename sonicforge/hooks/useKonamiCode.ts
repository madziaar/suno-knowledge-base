
import { useEffect, useState, useCallback } from 'react';

const konamiCode = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

export const useKonamiCode = (callback: () => void) => {
  const [sequence, setSequence] = useState<string[]>([]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const newSequence = [...sequence, e.key];
    
    // Check if the current sequence matches the start of the Konami code
    const isMatching = newSequence.every((key, index) => key.toLowerCase() === konamiCode[index].toLowerCase());

    if (isMatching) {
      if (newSequence.length === konamiCode.length) {
        // Code entered successfully
        callback();
        setSequence([]); // Reset for next time
      } else {
        // Continue listening
        setSequence(newSequence);
      }
    } else {
      // Wrong key, reset
      setSequence([]);
    }
  }, [sequence, callback]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};
