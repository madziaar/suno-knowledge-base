
import { useState, useEffect } from 'react';
import { triggerHaptic } from '../lib/haptics';

export const useTypewriter = (text: string | undefined, speed: number = 5) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
        setDisplayedText('');
        return;
    }

    setDisplayedText(''); // Reset on new text
    let i = 0;
    let hapticCounter = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        // Optimization: Add chunks for long text to avoid slow rendering
        const chunk = text.slice(i, i + 3); 
        setDisplayedText((prev) => prev + chunk);
        i += 3;
        
        // Haptic Feedback every 3rd chunk (roughly every 9 chars) to simulate typing feel without spamming
        hapticCounter++;
        if (hapticCounter % 3 === 0) {
            triggerHaptic('light');
        }
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
};
