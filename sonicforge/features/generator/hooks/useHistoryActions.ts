
import { useHistory } from '../../../contexts/HistoryContext';
import { GeneratedPrompt, SongConcept, ExpertInputs, GroundingChunk } from '../../../types';

export const useHistoryActions = () => {
  const { addToHistory, loadFromHistory } = useHistory();

  const saveToHistory = (
    result: GeneratedPrompt,
    inputs: SongConcept,
    expertInputs: ExpertInputs | undefined,
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    researchData: { text: string; sources: GroundingChunk[] } | null
  ) => {
    addToHistory({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      inputs: { ...inputs },
      expertInputs: expertInputs ? { ...expertInputs } : undefined,
      isExpertMode,
      result,
      lyricSource,
      researchData
    });
  };

  return { saveToHistory, loadFromHistory };
};
