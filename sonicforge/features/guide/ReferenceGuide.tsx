import React from 'react';
import { Tag, PlayCircle, Layers, Zap, CheckCircle, AlertTriangle, Copy, ArrowRight, Mic2, Wrench, Sparkles, Wand2, Music2, BookOpen, UserCog, Upload, Search, Palette, Star, MessageSquare, RefreshCw, Clock, LayoutGrid, Lightbulb, ListChecks, BrainCircuit, ShieldCheck, Waves, Radio, Globe, Activity, Cpu, Binary } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import GuideSection from './components/GuideSection';
import GuideNavigation from './components/GuideNavigation';
import { cn } from '../../lib/utils';
import { sfx } from '../../lib/audio';

interface ClickableTagProps {
  children: React.ReactNode;
  isPyriteMode: boolean;
  showToast: (msg: string, type?: any) => void;
  lang: Language;
}

const ClickableTag: React.FC<ClickableTagProps> = ({ children, isPyriteMode, showToast, lang }) => {
  const text = children as string;
  const isStructural = text.startsWith('[');

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    const toastMsg = translations[lang].toast.tagCopied || "Tag Copied:";
    showToast(`${toastMsg} ${text}`, 'success');
    sfx.play('click');
  };

  const className = cn(
    "font-mono px-2 py-1 rounded-md border transition-all cursor-pointer group relative inline-flex items-center gap-1.5 text-[10px] md:text-xs",
    isPyriteMode
      ? (isStructural ? 'bg-purple-900/50 border-purple-500/50 text-purple-300 hover:bg-purple-500/30' : 'bg-pink-900/50 border-pink-500/50 text-pink-300 hover:bg-pink-500/30')
      : (isStructural ? 'bg-yellow-900/50 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20' : 'bg-blue-900/50 border-blue-500/50 text-blue-300 hover:bg-blue-500/20')
  );

  return (
    <button onClick={handleClick} className={className}>
      {children}
      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

const ReferenceGuide = ({ lang, showToast }: { lang: Language, showToast: (msg: string, type?: any) => void }) => {
  const tGuide = translations[lang]?.guide;
  const isPyriteMode = document.body.classList.contains('pyrite-mode');

  if (!tGuide) return null;
  
  const TagButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ClickableTag isPyriteMode={isPyriteMode} showToast={showToast} lang={lang}>{children}</ClickableTag>
  );

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] animate-pulse pointer-events-none" />
        <h2 className={cn(
            "text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase relative z-10",
            isPyriteMode ? "text-white glitch-text" : "text-white"
        )} data-text={tGuide.title}>
            {tGuide.title}
        </h2>
        <p className="text-sm md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            The definitive manual for Suno V4.5+ & v5.0 Architecture. <br/>
            <span className={cn(isPyriteMode ? "text-purple-400" : "text-yellow-500")}>Studio Quality. Agent-optimized. Deep Reasoning Enabled.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        <div className="lg:col-span-1">
            <GuideNavigation t={tGuide} isPyriteMode={isPyriteMode} />
            
            {/* Persona Commentary */}
            <div className={cn(
                "mt-6 p-6 rounded-3xl border relative overflow-hidden hidden lg:block",
                isPyriteMode ? "bg-purple-900/10 border-purple-500/20" : "bg-black/20 border-white/5"
            )}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
                <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2", isPyriteMode ? "text-purple-400" : "text-yellow-500")}>
                    <Binary className="w-3.5 h-3.5" />
                    Pyrite's Note
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "Listen closely, Darling. v5 is studio-quality. We're not just generating 'songs' anymore—we're architecting masters. Front-load your genre, lock your vocals, and for heaven's sake, don't forget the power ending."
                </p>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
            
            {/* SECTION: PROTOCOL OBSIDIAN */}
            <GuideSection id="start" title="Protocol Obsidian: The Reasoning Engine" icon={BrainCircuit}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                                V7.2 executes an **Agentic Cascade**. The Neural Core (Gemini 3 Pro) doesn't just write a prompt—it blueprints a world.
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    32,768 Thinking Token Budget
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                    Real-time Metadata Ingestion
                                </div>
                            </div>
                        </div>
                        <div className={cn("p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-4", isPyriteMode ? "bg-purple-900/5 border-purple-500/10" : "bg-black/20 border-white/5")}>
                            <Cpu className={cn("w-12 h-12 animate-spin-slow", isPyriteMode ? "text-purple-500" : "text-yellow-500")} />
                            <div>
                                <h5 className="font-bold text-white text-sm uppercase tracking-widest">Reasoning Active</h5>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">NARRATIVE_ARCH_V5_STUDIO</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { title: "Research", icon: Search, color: "text-blue-400", desc: "Scans WMG & database specs." },
                            { title: "Blueprint", icon: Palette, color: "text-purple-400", desc: "Architects hierarchical strings." },
                            { title: "Audit", icon: ShieldCheck, color: "text-green-400", desc: "Checks character limits (400)." },
                            { title: "Refine", icon: RefreshCw, color: "text-red-400", desc: "Surgically repairs logic flaws." }
                        ].map((step, i) => (
                            <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                <step.icon className={cn("w-5 h-5 mb-3", step.color, "group-hover:scale-110 transition-transform")} />
                                <h6 className="font-bold text-white text-[10px] uppercase mb-1 tracking-wider">{step.title}</h6>
                                <p className="text-[9px] text-zinc-500 leading-tight">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: SUNO STUDIO */}
            <GuideSection id="advanced" title="Suno Studio: The Generative DAW" icon={LayoutGrid}>
                <div className="space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Suno Studio (v5) introduces world-first multi-track generative capabilities. V7.2 of the Forge is designed to feed this engine perfectly with 12-stem compatibility.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: "12-Stem Extraction", desc: "Separate vocals, drums, and lead synths with clinical precision." },
                            { title: "MIDI Export", desc: "Export generated melodies to your local DAW for full control." },
                            { title: "Multi-Track", desc: "Layer generated audio with your own stems seamlessly." }
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5">
                                <h5 className="text-[10px] font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" /> {item.title}
                                </h5>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: THE GOLDEN RULES */}
            <GuideSection id="riffusion" title="The Golden Protocols (V5)" icon={Lightbulb}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tGuide.goldenRules.rules.map((rule: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs", isPyriteMode ? "bg-purple-600 text-white" : "bg-yellow-500 text-black")}>
                                {i + 1}
                            </div>
                            <div>
                                <h5 className="font-bold text-white text-sm mb-1">{rule.title}</h5>
                                <p className="text-xs text-zinc-500 leading-relaxed">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GuideSection>

            {/* SECTION: V4.5+ MASTER TAGS */}
            <GuideSection id="tags" title="V4.5+ / v5.0 Meta Lexicon" icon={Tag}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l-2 border-yellow-500 pl-3">The Termination Protocol</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                v5 has incredible quality but still risks abrupt cutoffs. My engine uses a **Triple-Kill Sequence** to ensure clean endings.
                            </p>
                            <div className="flex gap-2">
                                <TagButton>[Outro]</TagButton>
                                <TagButton>[Instrumental Fade Out]</TagButton>
                                <TagButton>[End]</TagButton>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">The Pipe Operator | Modifiers</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                The `|` character is the gold standard for separating section modifiers in the 2025 models.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <TagButton>[Chorus | Anthemic | Epic]</TagButton>
                                <TagButton>[Verse | Minimal | Lo-fi]</TagButton>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                        {Object.entries(tGuide.tags.categories).map(([key, category]: [string, any]) => (
                            <div key={key}>
                                <h6 className="text-[9px] font-bold text-zinc-600 uppercase mb-3">{category.title}</h6>
                                <div className="flex flex-wrap gap-2">
                                    {category.items.map((tag: string) => (
                                        <TagButton key={tag}>{tag}</TagButton>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: TROUBLESHOOTING */}
            <GuideSection id="troubleshooting" title="Signal Maintenance" icon={Wrench}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: tGuide.troubleshooting.abruptEnding, desc: tGuide.troubleshooting.abruptEndingDesc, fix: "[Outro Instrumental fade outEnd]" },
                        { title: tGuide.troubleshooting.wrongInstrument, desc: tGuide.troubleshooting.wrongInstrumentDesc, fix: "Repeat tokens: [sax][saxophone][solo]" },
                        { title: "Vocal Glitches", desc: "Beta v5 models can glitch on complex words.", fix: "Add 'Natural phrasing' to style." },
                        { title: "Muddy Mix", desc: "v5 fixes this, but legacy tracks may suffer.", fix: "Use 'Studio mastered' and 'Crisp mix'." },
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-red-500/20 transition-all group">
                           <h5 className="font-bold text-red-100/90 text-sm mb-2 flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4 text-red-500" />
                               {item.title}
                           </h5>
                           <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">{item.desc}</p>
                           <div className="bg-black/60 p-2 rounded-lg border border-white/5 text-[9px] font-mono text-zinc-400">
                               <span className="text-zinc-600 mr-2 uppercase">Fix:</span> {item.fix}
                           </div>
                        </div>
                    ))}
                </div>
            </GuideSection>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="mt-20 text-center">
          <button 
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); sfx.play('toggle'); }}
            className={cn(
                "px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-2xl",
                isPyriteMode ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-white text-black hover:bg-zinc-200"
            )}
          >
              Return to Control Lobe
          </button>
      </div>
    </div>
  );
};

export default ReferenceGuide;