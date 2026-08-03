
import React, { useEffect } from 'react';
import { SongConcept, ExpertInputs } from '../../../types';
import { SharePayload } from '../../../lib/sharing';

export const useFormSync = (
  sharedData: SharePayload | null | undefined,
  setInputs: React.Dispatch<React.SetStateAction<SongConcept & { lyricsInput: string }>>,
  setExpertInputs: React.Dispatch<React.SetStateAction<ExpertInputs>>,
  setIsExpertMode: React.Dispatch<React.SetStateAction<boolean>>,
  draftData: string | null // Optional draft to load on init if no share data
) => {
  
  // 1. Handle Shared Data (High Priority)
  useEffect(() => {
    if (sharedData) {
        setInputs({
            ...sharedData.inputs,
            platform: sharedData.inputs.platform || 'suno',
        });
        setExpertInputs(sharedData.expertInputs);
        setIsExpertMode(sharedData.isExpertMode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [sharedData, setInputs, setExpertInputs, setIsExpertMode]);

  // 2. Handle Draft Data (Low Priority - Only on mount if no shared data)
  useEffect(() => {
    if (!sharedData && draftData) {
        try {
            const parsed = JSON.parse(draftData);
            if (parsed.inputs) setInputs(parsed.inputs);
            if (parsed.expertInputs) setExpertInputs(parsed.expertInputs);
            if (parsed.isExpertMode !== undefined) setIsExpertMode(parsed.isExpertMode);
        } catch (e) {
            console.error("Failed to load draft");
        }
    }
    // Dependency array intentionally empty-ish to run once on mount logic effectively
    // But we rely on the component mounting lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
};
