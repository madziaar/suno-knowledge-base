
import React from 'react';
import { GenreTemplate, Language } from '../../../types';
import { ArrowUpRight, Music } from 'lucide-react';
import GlassPanel from '../../../components/shared/GlassPanel';
import { cn } from '../../../lib/utils';
import ThemedButton from '../../../components/shared/ThemedButton';

interface TemplateCardProps {
    template: GenreTemplate;
    onLoad: (template: GenreTemplate) => void;
    lang: Language;
    isPyriteMode: boolean;
    t: any;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, lang, isPyriteMode, t }) => {
    const getName = (t: GenreTemplate, l: Language) => {
        if (l === 'pl') return t.name.pl;
        return t.name.en;
    };

    const name = getName(template, lang);
    const categoryColor = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';

    return (
        <GlassPanel
            variant={isPyriteMode ? 'pyrite' : 'default'}
            layer="card"
            className="flex flex-col h-full group"
        >
            <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-md ${isPyriteMode ? 'bg-purple-500/10' : 'bg-yellow-500/10'}`}>
                           <Music className={`w-4 h-4 ${categoryColor}`} />
                         </div>
                         <span className={`text-xs font-bold uppercase tracking-wider ${categoryColor}`}>
                            {template.category}
                         </span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono line-clamp-3 leading-relaxed mb-4">
                    {template.stylePrompt}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex justify-end">
                <ThemedButton
                    onClick={() => onLoad(template)}
                    variant="zinc"
                    className="px-4 py-2 text-xs"
                >
                    {t.load}
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                </ThemedButton>
            </div>
        </GlassPanel>
    );
};

export default TemplateCard;