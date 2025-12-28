
import React, { memo } from 'react';
import { Languages, Type } from 'lucide-react';
import CustomSelect from '../../../../components/shared/CustomSelect';
import { LYRIC_LANGUAGES } from '../../data/autocompleteData';
import { BuilderTranslation } from '../../../../types';
import { usePromptState } from '../../../../contexts/PromptContext';
import { usePromptActions } from '../../hooks/usePromptActions';
import Tooltip from '../../../../components/Tooltip';

interface MetaControlsProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const MetaControls: React.FC<MetaControlsProps> = memo(({ t, isPyriteMode }) => {
  const { inputs } = usePromptState();
  const { updateInput } = usePromptActions();

  return (
    <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
      <div>
        <div className="flex items-center mb-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isPyriteMode ? 'text-purple-300/80' : 'text-zinc-500'}`}>
                <Languages className="w-3 h-3" />
                {t.lyricsLangLabel || "Target Language"}
            </label>
            <Tooltip content="Sets the language for Lyrics and Title. Style tags will remain in English for better AI processing." />
        </div>
        
        <CustomSelect 
            value={inputs.lyricsLanguage || ''}
            onChange={(val) => updateInput({ lyricsLanguage: val })}
            options={[{ label: 'Auto-Detect', value: '' }, ...LYRIC_LANGUAGES.map(l => ({ label: l, value: l }))]}
            placeholder="Auto (Detect from Concept)"
            variant={isPyriteMode ? 'pyrite' : 'default'}
            icon={<Type className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
});

export default MetaControls;
