
import React, { memo, useCallback } from 'react';
import PresetSelector from '../ConfigForm/PresetSelector';
import ModeSelector from '../ConfigForm/ModeSelector';
import { BuilderTranslation, UserPreset } from '../../../../types';
import { usePromptState } from '../../../../contexts/PromptContext';
import { usePromptActions } from '../../hooks/usePromptActions';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';

interface ControlBarProps {
  onPresetLoad: (name: string) => void;
  onClear: () => void;
  onRandomize: () => void;
  onShare: () => void;
  onUserPresetLoad: (preset: UserPreset) => void;
  onPresetChange: (presetId: string) => void;
  t: BuilderTranslation;
  isPyriteMode: boolean; // Keep prop name for component stability but map it from isOverclockedMode in parent
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
  const { updateInput, setMode, setLyricSource } = usePromptActions();

  const handleUseReMi = useCallback((val: boolean) => {
      updateInput({ useReMi: val });
      sfx.play(val ? 'secret' : 'click');
  }, [updateInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Top Row: Presets & Actions */}
        <PresetSelector 
            onPresetChange={onPresetChange}
            onUserPresetLoad={onUserPresetLoad}
            onShare={onShare}
            onRandomize={onRandomize}
            onClear={onClear}
            t={t}
            isOverclockedMode={isPyriteMode} // Mapping prop
            lang={lang}
            currentInputs={inputs}
            currentExpertInputs={expertInputs}
            showToast={showToast}
        />

        {/* Mode Selector Row */}
        <div className={cn(
            "p-3 rounded-xl border transition-all duration-300",
            isPyriteMode ? "bg-purple-900/10 border-purple-500/20" : "bg-zinc-900/40 border-white/5"
        )}>
            <ModeSelector 
                mode={inputs.mode}
                setMode={setMode}
                lyricSource={lyricSource} 
                setLyricSource={setLyricSource}
                useReMi={inputs.useReMi || false}
                setUseReMi={handleUseReMi}
                t={t}
                isPyriteMode={isPyriteMode}
            />
        </div>
      </div>
    </div>
  );
});

export default ControlBar;
