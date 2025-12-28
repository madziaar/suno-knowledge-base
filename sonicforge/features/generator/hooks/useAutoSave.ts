
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../../lib/constants';
import { SongConcept, ExpertInputs } from '../../../types';

export const useAutoSave = (
  inputs: SongConcept & { lyricsInput: string },
  expertInputs: ExpertInputs,
  isExpertMode: boolean,
  lang: 'en' | 'pl'
) => {
  const [draft, setDraft] = useLocalStorage(STORAGE_KEYS.DRAFT, '');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Ref to track if it's the initial mount to avoid saving empty state immediately
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const current = JSON.stringify({ inputs, expertInputs, isExpertMode });
      if (current !== draft) {
        setDraft(current);
        const now = new Date();
        setLastSaved(now.toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(handler);
  }, [inputs, expertInputs, isExpertMode, draft, setDraft, lang]);

  const clearDraft = useCallback(() => {
    setDraft('');
    setLastSaved(null);
  }, [setDraft]);

  return { draft, lastSaved, clearDraft };
};
