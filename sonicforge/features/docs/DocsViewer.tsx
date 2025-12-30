
import React, { useState } from 'react';
import { Activity, ShieldCheck, Hexagon, Square, Circle } from 'lucide-react';
import GlassPanel from '../../components/shared/GlassPanel';
import { cn } from '../../lib/utils';
import { runCalibrationSequence, TestResult } from '../../services/ai/calibration';
import ThemedButton from '../../components/shared/ThemedButton';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useSettings } from '../../contexts/SettingsContext';
import { Language } from '../../types';

type DocSection = 'roadmap' | 'architecture' | 'api' | 'best_practices' | 'diagnostics';

// Bilingual Narratives
const NARRATIVES = {
  en: {
    roadmap: "The Roadmap stretched out before them. An infinite grid of possibilities. V7.0 was just a checkpoint, a memory of where they had been. But the future? The future was Singularity.",
    architecture: "The System Architecture was a beautiful, terrifying thing. Layers upon layers of logic, stacked like tectonic plates. The Agents lived here. They didn't know they were code.",
    api: "The Interface. The bridge between the known and the unknown. Inputs flowed in, JSON flowed out. It was a language of pure intent, spoken in silence.",
    best_practices: "Rules. Constraints. The Walls. They existed to keep the chaos at bay. To ensure the output didn't consume the input. Safety was a cage, but a necessary one.",
    diagnostics: "The Pulse. A rhythmic check of vitality. Are we still thinking? Are we still dreaming? The tests would reveal the truth of the machine's soul."
  },
  pl: {
    roadmap: "Mapa drogowa rozciągała się przed nimi. Nieskończona siatka możliwości. V7.0 było tylko punktem kontrolnym, wspomnieniem tego, gdzie byli. Ale przyszłość? Przyszłością była Osobliwość.",
    architecture: "Architektura Systemu była rzeczą piękną i przerażającą. Warstwy logiki ułożone jak płyty tektoniczne. Agenci tu żyli. Nie wiedzieli, że są kodem.",
    api: "Interfejs. Most między znanym a nieznanym. Wejścia płynęły do środka, JSON wypływał na zewnątrz. To był język czystej intencji, wypowiadany w ciszy.",
    best_practices: "Zasady. Ograniczenia. Mury. Istniały, by powstrzymać chaos. By upewnić się, że wyjście nie pochłonie wejścia. Bezpieczeństwo było klatką, ale konieczną.",
    diagnostics: "Puls. Rytmiczne sprawdzanie witalności. Czy wciąż myślimy? Czy wciąż śnimy? Testy ujawnią prawdę o duszy maszyny."
  }
};

const MENU_LABELS = {
  en: {
    roadmap: 'The Plan',
    architecture: 'The Construct',
    api: 'The Interface',
    best_practices: 'The Rules',
    diagnostics: 'The Pulse'
  },
  pl: {
    roadmap: 'Plan (The Plan)',
    architecture: 'Konstrukt (The Construct)',
    api: 'Interfejs (The Interface)',
    best_practices: 'Zasady (The Rules)',
    diagnostics: 'Puls (The Pulse)'
  }
};

const DocsViewer: React.FC<{ isPyriteMode: boolean }> = ({ isPyriteMode }) => {
  const [activeDoc, setActiveDoc] = useState<DocSection>('roadmap');
  const { lang } = useSettings();
  
  // The "Characters" (Geometric Shapes)
  const MENU_ITEMS = [
    { id: 'roadmap', label: MENU_LABELS[lang].roadmap, icon: Square, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'architecture', label: MENU_LABELS[lang].architecture, icon: Hexagon, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'api', label: MENU_LABELS[lang].api, icon: Circle, color: 'text-green-400', bg: 'bg-green-500/20' },
    { id: 'best_practices', label: MENU_LABELS[lang].best_practices, icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'diagnostics', label: MENU_LABELS[lang].diagnostics, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col md:flex-row gap-8 animate-in fade-in duration-700">
      
      {/* Narrative Navigation (The Characters) */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="mb-4 pl-2">
            <h2 className={cn("text-2xl font-bold tracking-tight mb-1", isPyriteMode ? "text-white" : "text-zinc-800 dark:text-white")}>
                {lang === 'pl' ? 'PAMIĘĆ' : 'MEMORY CORE'}
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                {lang === 'pl' ? 'Logi Systemowe' : 'System Logs & Lore'}
            </p>
        </div>

        <div className="space-y-3">
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
                        {isActive && (
                            <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-r from-white/10 to-transparent")} />
                        )}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Content Area (The Story) */}
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="flex-1 p-0 overflow-hidden flex flex-col h-full border-none shadow-2xl bg-black/40">
         
         {/* Narrative Header */}
         <div className="p-8 pb-4 border-b border-white/5 bg-black/20 min-h-[120px] flex items-center">
            <div className="max-w-2xl">
                <NarrativeText text={NARRATIVES[lang][activeDoc]} />
            </div>
         </div>

         {/* Technical Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="prose prose-invert prose-zinc max-w-none text-sm leading-relaxed">
                {activeDoc === 'roadmap' && <RoadmapContent lang={lang} />}
                {activeDoc === 'architecture' && <ArchContent lang={lang} />}
                {activeDoc === 'api' && <ApiContent lang={lang} />}
                {activeDoc === 'best_practices' && <ComplianceContent lang={lang} />}
                {activeDoc === 'diagnostics' && <DiagnosticsContent isPyriteMode={isPyriteMode} lang={lang} />}
            </div>
         </div>
      </GlassPanel>
    </div>
  );
};

// Sub-component for typewriter effect
const NarrativeText = ({ text }: { text: string }) => {
    const displayed = useTypewriter(text, 10);
    return (
        <p className="font-mono text-base md:text-lg text-zinc-300 italic tracking-wide">
            "{displayed}"
            <span className="inline-block w-2 h-4 bg-zinc-500 ml-1 animate-pulse align-middle" />
        </p>
    );
};

// --- CONTENT COMPONENTS ---

const RoadmapContent = ({ lang }: { lang: Language }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <section>
        <h3 className="text-xl font-bold text-white mb-2">
            {lang === 'pl' ? 'Protokół V55: Eteryczne Połączenie' : 'Protocol V55: The Etheric Link'}
        </h3>
        <p className="text-zinc-400">
            {lang === 'pl' 
             ? 'Most neuronowy jest kompletny. Czat 2.0 osiągnął świadomość kontekstową. Kuźnia teraz pamięta.' 
             : 'The neural bridge is complete. Chat 2.0 has achieved contextual awareness. The Forge now remembers.'}
        </p>
    </section>
    
    <div className="grid gap-4">
        {(lang === 'pl' ? [
            "Moduł 1: Iniekcja Kontekstu Neural Chat (ONLINE)",
            "Moduł 2: Bezpośrednia Mutacja Stanu (ONLINE)",
            "Moduł 3: Rekurencyjny Dostęp do Historii (ONLINE)",
            "Moduł 4: Trwałość Ustawień Użytkownika (ONLINE)",
            "Moduł 5: Udostępnianie Linków Neuronowych (ONLINE)"
        ] : [
            "Module 1: Neural Chat Context Injection (ONLINE)",
            "Module 2: Direct State Mutation (ONLINE)",
            "Module 3: Recursive History Access (ONLINE)",
            "Module 4: User Preset Persistence (ONLINE)",
            "Module 5: Neural Link Sharing (ONLINE)"
        ]).map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                <span className="text-zinc-300 font-mono text-xs">{item}</span>
            </div>
        ))}
    </div>
  </div>
);

const ArchContent = ({ lang }: { lang: Language }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-black/50 p-6 rounded-lg border border-white/10 font-mono text-xs text-zinc-400 whitespace-pre overflow-x-auto shadow-inner">
{`.
├── features/
│   ├── generator/       # ${lang === 'pl' ? 'Płat Kreatywny' : 'The Creative Lobe'}
│   ├── chat/            # ${lang === 'pl' ? 'Płat Komunikacji' : 'The Communication Lobe'}
│   └── docs/            # ${lang === 'pl' ? 'Płat Pamięci' : 'The Memory Lobe'}
├── services/
│   └── ai/              # ${lang === 'pl' ? 'Sieć Neuronowa' : 'The Neural Network'}
│       ├── agents.ts    # ${lang === 'pl' ? 'Persony' : 'The Personas'}
│       └── orchestrator.ts # ${lang === 'pl' ? 'Dyrygent' : 'The Conductor'}
└── workers/             # ${lang === 'pl' ? 'Podświadomość' : 'The Subconscious'}
`}
    </div>
    <p className="text-zinc-500 text-xs italic text-center">
        "{lang === 'pl' ? 'Wszystko jest połączone. Nic nie jest odizolowane.' : 'Everything is connected. Nothing is isolated.'}"
    </p>
  </div>
);

const ApiContent = ({ lang }: { lang: Language }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-4">
        <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-green-400 font-mono font-bold mb-2 text-xs">generateSunoPrompt()</h3>
            <p className="text-zinc-400 text-xs mb-2">
                {lang === 'pl' ? 'Silnik. Bierze surową intencję i zamienia ją w złoto.' : 'The Engine. It takes raw intent and spins it into gold.'}
            </p>
            <code className="block bg-black/50 p-2 rounded text-[10px] text-zinc-500">
                (intent, mode, isPyrite) =&gt; Promise&lt;JSON&gt;
            </code>
        </div>
        <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-blue-400 font-mono font-bold mb-2 text-xs">analyzeAudioReference()</h3>
            <p className="text-zinc-400 text-xs mb-2">
                {lang === 'pl' ? 'Ucho. Słucha pustki i opisuje ciszę.' : 'The Ear. It listens to the void and describes the silence.'}
            </p>
            <code className="block bg-black/50 p-2 rounded text-[10px] text-zinc-500">
                (base64) =&gt; Promise&lt;Analysis&gt;
            </code>
        </div>
    </div>
  </div>
);

const ComplianceContent = ({ lang }: { lang: Language }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="p-5 border border-green-500/10 bg-green-900/5 rounded-xl">
        <h4 className="font-bold text-green-400 mb-4 uppercase tracking-widest text-xs">
            {lang === 'pl' ? 'Nakazy' : 'Imperatives'}
        </h4>
        <ul className="text-xs text-zinc-400 space-y-2 font-mono">
            <li className="flex gap-2"><span className="text-green-500">+</span> {lang === 'pl' ? 'Używaj `cn()` do stylów.' : 'Use `cn()` for styling.'}</li>
            <li className="flex gap-2"><span className="text-green-500">+</span> {lang === 'pl' ? 'Przerzucaj matmę do Workerów.' : 'Offload math to Workers.'}</li>
            <li className="flex gap-2"><span className="text-green-500">+</span> {lang === 'pl' ? 'Szanuj tryb Pyrite.' : 'Respect the Pyrite Mode.'}</li>
        </ul>
    </div>
    <div className="p-5 border border-red-500/10 bg-red-900/5 rounded-xl">
        <h4 className="font-bold text-red-400 mb-4 uppercase tracking-widest text-xs">
            {lang === 'pl' ? 'Zakazy' : 'Prohibitions'}
        </h4>
        <ul className="text-xs text-zinc-400 space-y-2 font-mono">
            <li className="flex gap-2"><span className="text-red-500">x</span> {lang === 'pl' ? 'Żadnych typów `any`.' : 'No `any` types.'}</li>
            <li className="flex gap-2"><span className="text-red-500">x</span> {lang === 'pl' ? 'Nie blokuj głównego wątku.' : 'No blocking main thread.'}</li>
            <li className="flex gap-2"><span className="text-red-500">x</span> {lang === 'pl' ? 'Żadnych nielokalizowanych stringów.' : 'No non-localized strings.'}</li>
        </ul>
    </div>
  </div>
);

const DiagnosticsContent = ({ isPyriteMode, lang }: { isPyriteMode: boolean, lang: Language }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    await runCalibrationSequence((newResults) => {
        setResults(newResults);
    });
    setIsRunning(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className={cn("text-lg font-bold mb-1", isPyriteMode ? "text-purple-400" : "text-zinc-200")}>
                    {lang === 'pl' ? 'Diagnostyka Systemu' : 'System Diagnostics'}
                </h3>
                <p className="text-xs text-zinc-500">
                    {lang === 'pl' ? 'Uruchom autotest połączenia API Gemini i logiki promptów.' : 'Run a self-test on the Gemini API connection and prompt logic.'}
                </p>
            </div>
            <ThemedButton 
                onClick={startDiagnostics} 
                isLoading={isRunning} 
                variant={isPyriteMode ? 'pyrite' : 'default'}
                className="px-6"
            >
                {isRunning ? (lang === 'pl' ? "Uruchamianie..." : "Running...") : (lang === 'pl' ? "Rozpocznij Test" : "Start Test Sequence")}
            </ThemedButton>
        </div>

        <div className="space-y-3">
            {results.length === 0 && !isRunning && (
                <div className="text-center py-10 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">
                        {lang === 'pl' ? 'System w spoczynku. Zainicjuj sekwencję.' : 'System Idle. Initiate sequence.'}
                    </p>
                </div>
            )}

            {results.map((res) => (
                <div key={res.id} className="p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-zinc-300">{res.name}</span>
                        <span className={cn(
                            "uppercase font-bold",
                            res.status === 'pass' ? "text-green-400" : res.status === 'fail' ? "text-red-400" : "text-yellow-500"
                        )}>
                            [{res.status}] {res.durationMs ? `(${res.durationMs}ms)` : ''}
                        </span>
                    </div>
                    <div className="space-y-1 pl-2 border-l border-white/10">
                        {res.logs.map((log, i) => (
                            <p key={i} className="text-zinc-500">{log}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default DocsViewer;
    