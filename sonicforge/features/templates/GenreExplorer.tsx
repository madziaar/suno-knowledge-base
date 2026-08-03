
import React, { useState, useMemo } from 'react';
import { LayoutGrid, Search, X } from 'lucide-react';
import { Language, GenreTemplate } from '../../types';
import { translations } from '../../translations';
import { getAllTemplates } from '../generator/utils/templateManager';
import TemplateCard from './components/TemplateCard';

interface GenreExplorerProps {
    lang: Language;
    onLoadTemplate: (template: GenreTemplate) => void;
    isPyriteMode: boolean;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ lang, onLoadTemplate, isPyriteMode }) => {
    const t = translations[lang].templates;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const templates = useMemo(() => getAllTemplates(), []);

    const categories = useMemo(() => {
        const cats = new Set(templates.map(t => t.category));
        return ['All', ...Array.from(cats)];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            // Language Fallback Logic
            let name = template.name.en;
            if (lang === 'pl') name = template.name.pl;

            const categoryMatch = filterCategory === 'All' || template.category === filterCategory;
            const searchMatch = !searchTerm ||
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.stylePrompt.toLowerCase().includes(searchTerm.toLowerCase());
            
            return categoryMatch && searchMatch;
        });
    }, [templates, searchTerm, filterCategory, lang]);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-yellow-500" />
                    {t.title}
                </h2>
                <p className="text-sm md:text-base text-zinc-500 max-w-lg mx-auto">{t.subtitle}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-40 bg-zinc-950/80 backdrop-blur-md py-4 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-9 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex-1 md:flex-none overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                                    filterCategory === cat
                                        ? (isPyriteMode ? 'bg-purple-600 text-white' : 'bg-yellow-500 text-black')
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onLoad={onLoadTemplate}
                            lang={lang}
                            isPyriteMode={isPyriteMode}
                            t={t}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <p>{t.empty}</p>
                    {searchTerm && <p>for "{searchTerm}"</p>}
                </div>
            )}
        </div>
    );
};

export default GenreExplorer;
