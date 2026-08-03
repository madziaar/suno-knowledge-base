
import React, { memo } from 'react';
import PresetSelector from '../ConfigForm/PresetSelector';
import ModeSelector from '../ConfigForm/ModeSelector';
import { BuilderTranslation, UserPreset } from '../../../../types';
import { usePromptState } from '../../../../contexts/PromptContext';
import { usePromptActions } from '../../hooks/usePromptActions';

interface ControlBarProps {
  onPresetLoad: (name: string) => void;
  onClear: () => void;
  onRandomize: () => void;
  onShare: () => void;
  onUserPresetLoad: (preset: UserPreset) => void;
  onPresetChange: (presetId: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean;
  lang: 'en' | 'pl';
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const ControlBar: React.FC<ControlBarProps> = memo(({
  onPresetLoad,
  onClear,
  onRandomize,
  onShare,
  onUserPresetLoad,
  onPresetChange,
  t,
  isPyriteMode,
  lang,
  showToast
}) => {
  const { inputs, expertInputs, lyricSource } = usePromptState();
  const { setMode, setLyricSource } = usePromptActions();

  return (
    <>
      <PresetSelector 
        onPresetChange={onPresetChange} 
        onUserPresetLoad={onUserPresetLoad}
        onShare={onShare}
        onRandomize={onRandomize} 
        onClear={onClear}
        t={t}
        isPyriteMode={isPyriteMode}
        lang={lang}
        currentInputs={inputs}
        currentExpertInputs={expertInputs}
        showToast={showToast}
      />
      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 mt-4">
        <ModeSelector 
            mode={inputs.mode}
            setMode={setMode}
            lyricSource={lyricSource}
            setLyricSource={setLyricSource}
            t={t}
            isPyriteMode={isPyriteMode}
        />
      </div>
    </>
  );
});

export default ControlBar;
