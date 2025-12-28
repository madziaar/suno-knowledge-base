
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
      {/* Header with Neural Pulse Effect */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] animate-pulse pointer-events-none" />
        <h2 className={cn(
            "text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase relative z-10",
            isPyriteMode ? "text-white glitch-text" : "text-white"
        )} data-text={tGuide.title}>
            {tGuide.title}
        </h2>
        <p className="text-sm md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            The definitive manual for Suno V4.5+ Architecture. <br/>
            <span className={cn(isPyriteMode ? "text-purple-400" : "text-yellow-500")}>Research-backed. Agent-optimized. Deep Reasoning Enabled.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        <div className="lg:col-span-1">
            <GuideNavigation t={tGuide} isPyriteMode={isPyriteMode} />
            
            {/* Persona Commentary Sidebar */}
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
                    "Listen closely, Darling. Suno isn't a mind-reader, but I am. When you build your prompts, think about the signal chain. If you bury your genre at the end, the model will just hallucinate 90s pub rock. Don't let that happen."
                </p>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
            
            {/* SECTION: DEEP REASONING PROTOCOL */}
            <GuideSection id="start" title="Protocol Obsidian: The Deep Reasoning Lobe" icon={BrainCircuit}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                                Unlike standard generators, Sonic Forge V5 executes an **Agentic Cascade**. When you click "Initiate Sequence", the Neural Core (Gemini 3 Pro) doesn't just write a prompt—it blueprints a world.
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    32k Thinking Budget Engaged
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                    Real-time Google Grounding
                                </div>
                            </div>
                        </div>
                        <div className={cn("p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-4", isPyriteMode ? "bg-purple-900/5 border-purple-500/10" : "bg-black/20 border-white/5")}>
                            <Cpu className={cn("w-12 h-12 animate-spin-slow", isPyriteMode ? "text-purple-500" : "text-yellow-500")} />
                            <div>
                                <h5 className="font-bold text-white text-sm uppercase tracking-widest">Reasoning Active</h5>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">PLANNING_NARRATIVE_ARC_V45</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { title: "Research", icon: Search, color: "text-blue-400", desc: "Scans technical archives for gear specs." },
                            { title: "Blueprint", icon: Palette, color: "text-purple-400", desc: "Architects the hierarchical string." },
                            { title: "Audit", icon: ShieldCheck, color: "text-green-400", desc: "Checks character limits and syntax." },
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

            {/* SECTION: HIERARCHICAL WEIGHTING */}
            <GuideSection id="advanced" title="The Golden Blueprint: Hierarchical Weighting" icon={Activity}>
                <div className="space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Suno V4.5 consumes the first **50 characters** of a prompt with **80% importance**. This is your "Anchor Zone". My engine automatically formats your DNA into this hierarchy:
                    </p>
                    
                    <div className="space-y-4">
                        <div className="relative h-12 w-full bg-zinc-900 rounded-xl border border-white/5 overflow-hidden flex items-center px-4 group">
                            <div className="absolute inset-y-0 left-0 w-[20%] bg-purple-500/20 border-r border-purple-500/50 group-hover:w-[25%] transition-all" />
                            <div className="absolute inset-y-0 left-0 w-[50%] bg-blue-500/10 border-r border-blue-500/30 pointer-events-none" />
                            <span className="relative z-10 text-[10px] font-mono text-white/90">
                                <span className="font-black text-purple-400">GENRE ANCHOR</span>, <span className="text-blue-400">VOCAL LOCK</span>, Atmospheric Descriptors, Gear Stacks, Master Chain
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> The Gender Guard
                                </h5>
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    To prevent vocal hallucinations, I inject the gender (Male/Female) immediately after the genre. 
                                    <br/><br/>
                                    <span className="text-purple-300 font-mono">Example: "Industrial Rock, Female Vocals, Sassy..."</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                    <Binary className="w-3.5 h-3.5 text-blue-400" /> The Repetition Hack
                                </h5>
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    Need a specific instrument solo? Don't be verbose. Repeat the core token to force the model's focus.
                                    <br/><br/>
                                    <span className="text-blue-300 font-mono">Formula: [sax][saxophone][solo]</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: V4.5 MASTER TAGS */}
            <GuideSection id="tags" title="V4.5+ Meta Lexicon" icon={Tag}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l-2 border-yellow-500 pl-3">The Termination Protocol</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                v4.5 has a known issue with abrupt cutoffs. My engine uses a **Triple-Kill Sequence** to ensure clean endings. Always use this at the end of your lyrics:
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
                                The `|` character is now the standard for separating section modifiers. It results in 40% higher adherence to section-specific vibes.
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
            <GuideSection id="troubleshooting" title="Maintenance & Signal Errors" icon={Wrench}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: tGuide.troubleshooting.abruptEnding, desc: tGuide.troubleshooting.abruptEndingDesc, fix: "[Instrumental Fade Out][End]" },
                        { title: tGuide.troubleshooting.wrongInstrument, desc: tGuide.troubleshooting.wrongInstrumentDesc, fix: "Repeat tokens: [piano][piano solo]" },
                        { title: tGuide.troubleshooting.roboticVocals, desc: tGuide.troubleshooting.roboticVocalsDesc, fix: "Add 'Pristine production' to style." },
                        { title: tGuide.troubleshooting.audioDegradation, desc: tGuide.troubleshooting.audioDegradationDesc, fix: "Check first 50 chars for clashes." },
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
