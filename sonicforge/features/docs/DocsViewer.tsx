
import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Hexagon, Square, BookUser, BrainCircuit, Database, Palette, Wifi, Book, PenTool } from 'lucide-react';
import GlassPanel from '../../components/shared/GlassPanel';
import { cn } from '../../lib/utils';
import ThemedButton from '../../components/shared/ThemedButton';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useSettings } from '../../contexts/SettingsContext';
import { Language } from '../../types';

type DocSection = 'user_guide' | 'knowledge_base' | 'prompting_guide' | 'architecture' | 'state' | 'ai_core' | 'components' | 'styling' | 'pwa';

const NARRATIVES = {
  en: {
    user_guide: "The Architect's Handbook. A guide to mastering the Forge, understanding its agentic core, and bending the neural network to your will. Knowledge is power, darling.",
    knowledge_base: "The Suno Codex. A comprehensive archive of V4.5+ capabilities, meta-tags, and industry intelligence. The definitive source of truth.",
    prompting_guide: "The Art of Instruction. A specialized grimoire for Style Prompts and Lyric Formatting. Learn the formulas, the tags, and the secrets of v5 control.",
    architecture: "The System Architecture was a beautiful, terrifying thing. Layers upon layers of logic, stacked like tectonic plates. The Agents lived here. They didn't know they were code.",
    state: "The Pulse. A river of data flowing through the machine's heart. Every click, every choice, remembered and cataloged in the great machine's memory.",
    ai_core: "The Neural Core. The bridge between the known and the unknown. Inputs flowed in, JSON flowed out. It was a language of pure intent, spoken in silence.",
    components: "The Interface. A thousand glowing screens, each a window into a different function. Knobs and sliders, waiting for a master's touch to give them purpose.",
    styling: "The Aegis. A shimmering cloak of colors and light, defining the machine's very soul. With a thought, the cold blue of logic could ignite into the chaotic purple of creation.",
    pwa: "The Subconscious. A ghost in the machine that worked in the background, caching memories, compressing thoughts, ensuring the forge could operate even when cut off from the network."
  },
  pl: {
    user_guide: "Podręcznik Architekta. Przewodnik po mistrzowskim opanowaniu Kuźni, zrozumieniu jej agentowego rdzenia i naginaniu sieci neuronowej do swojej woli. Wiedza to władza, kochanie.",
    knowledge_base: "Kodeks Suno. Kompleksowe archiwum możliwości V4.5+, meta-tagów i wywiadu branżowego. Ostateczne źródło prawdy.",
    prompting_guide: "Sztuka Instrukcji. Wyspecjalizowany grymuar dla Promptów Stylu i Formatowania Tekstu. Poznaj formuły, tagi i sekrety kontroli v5.",
    architecture: "Architektura Systemu była rzeczą piękną i przerażającą. Warstwy logiki ułożone jak płyty tektoniczne. Agenci tu żyli. Nie wiedzieli, że są kodem.",
    state: "Puls. Rzeka danych płynąca przez serce maszyny. Każde kliknięcie, każdy wybór, zapamiętany i skatalogowany w wielkiej pamięci maszyny.",
    ai_core: "Rdzeń Neuronowy. Most między znanym a nieznanym. Wejścia płynęły do środka, JSON wypływał na zewnątrz. To był język czystej intencji, wypowiadany w ciszy.",
    components: "Interfejs. Tysiąc świecących ekranów, każdy z nich to okno na inną funkcję. Pokrętła i suwaki, czekające na dotyk mistrza, by nadać im cel.",
    styling: "Egida. Lśniący płaszcz kolorów i światła, definiujący samą duszę maszyny. Jedną myślą, chłodny błękit logiki mógł zapłonąć chaotycznym fioletem tworzenia.",
    pwa: "Podświadomość. Duch w maszynie, który pracował w tle, buforując wspomnienia, kompresując myśli, zapewniając, że kuźnia może działać nawet odcięta od sieci."
  }
};

const MENU_LABELS = {
  en: {
    user_guide: 'User Guide',
    knowledge_base: 'Knowledge Base',
    prompting_guide: 'Prompting Guide',
    architecture: 'The Construct',
    state: 'The Pulse',
    ai_core: 'The Neural Core',
    components: 'The Interface',
    styling: 'The Aegis',
    pwa: 'The Subconscious'
  },
  pl: {
    user_guide: 'Instrukcja Obsługi',
    knowledge_base: 'Baza Wiedzy',
    prompting_guide: 'Przewodnik Promptowania',
    architecture: 'Konstrukt',
    state: 'Puls',
    ai_core: 'Rdzeń Neuronowy',
    components: 'Interfejs',
    styling: 'Egida',
    pwa: 'Podświadomość'
  }
};

const DocsViewer: React.FC<{ isPyriteMode: boolean }> = ({ isPyriteMode }) => {
  const [activeDoc, setActiveDoc] = useState<DocSection>('user_guide');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useSettings();
  
  const MENU_ITEMS = [
    { id: 'user_guide', label: MENU_LABELS[lang].user_guide, icon: BookUser, color: 'text-white', bg: 'bg-white/10' },
    { id: 'knowledge_base', label: MENU_LABELS[lang].knowledge_base, icon: Book, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'prompting_guide', label: MENU_LABELS[lang].prompting_guide, icon: PenTool, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { id: 'architecture', label: MENU_LABELS[lang].architecture, icon: Hexagon, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'state', label: MENU_LABELS[lang].state, icon: Database, color: 'text-green-400', bg: 'bg-green-500/20' },
    { id: 'ai_core', label: MENU_LABELS[lang].ai_core, icon: BrainCircuit, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'components', label: MENU_LABELS[lang].components, icon: Square, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'styling', label: MENU_LABELS[lang].styling, icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { id: 'pwa', label: MENU_LABELS[lang].pwa, icon: Wifi, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true);
      try {
        const fileMap = {
          user_guide: 'user_guide.md',
          knowledge_base: 'suno_knowledge_base.md',
          prompting_guide: 'suno_prompting_guide.md',
          architecture: 'architecture.md',
          state: 'state_management.md',
          ai_core: 'ai_core.md',
          components: 'ui_components.md',
          styling: 'styling_theming.md',
          pwa: 'pwa_workers.md'
        };
        const response = await fetch(`./features/docs/data/${fileMap[activeDoc]}`);
        if (!response.ok) throw new Error('Doc not found');
        const text = await response.text();
        setContent(text);
      } catch (error) {
        setContent('Error loading documentation file.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [activeDoc]);

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col md:flex-row gap-8 animate-in fade-in duration-700">
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="mb-4 pl-2">
            <h2 className="text-2xl font-bold tracking-tight mb-1 text-white">
                {lang === 'pl' ? 'PAMIĘĆ' : 'MEMORY CORE'}
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                {lang === 'pl' ? 'Logi Systemowe' : 'System Schematics'}
            </p>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
            {MENU_ITEMS.map((item) => {
                const isActive = activeDoc === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveDoc(item.id as DocSection)}
                        className={cn(
                            "group w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden border",
                            isActive 
                                ? `border-white/10 ${item.bg} scale-105 shadow-lg` 
                                : "bg-zinc-900/40 border-transparent hover:bg-zinc-800/60 scale-100 opacity-60 hover:opacity-100"
                        )}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <item.icon className={cn("w-5 h-5 transition-transform group-hover:rotate-12", item.color)} />
                            <span className={cn("font-bold text-sm", isActive ? "text-white" : "text-zinc-400")}>
                                {item.label}
                            </span>
                        </div>
                        {isActive && <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-r from-white/10 to-transparent")} />}
                    </button>
                )
            })}
        </div>
      </div>
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="flex-1 p-0 overflow-hidden flex flex-col h-full border-none shadow-2xl bg-black/40">
         <div className="p-8 pb-4 border-b border-white/5 bg-black/20 min-h-[120px] flex items-center">
            <div className="max-w-2xl">
                <NarrativeText text={NARRATIVES[lang][activeDoc]} />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {isLoading ? <div className="text-zinc-500">Loading schematics...</div> : (
              <pre className="font-mono text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                <code>{content}</code>
              </pre>
            )}
         </div>
      </GlassPanel>
    </div>
  );
};

const NarrativeText = ({ text }: { text: string }) => {
    const displayed = useTypewriter(text, 10);
    return (
        <p className="font-mono text-base md:text-lg text-zinc-300 italic tracking-wide">
            "{displayed}"
            <span className="inline-block w-2 h-4 bg-zinc-500 ml-1 animate-pulse align-middle" />
        </p>
    );
};

export default DocsViewer;
