
import React from 'react';
/* Added missing Radio icon to imports */
import { Tag, PlayCircle, Layers, Zap, CheckCircle, AlertTriangle, Copy, ArrowRight, Mic2, Wrench, Sparkles, Wand2, Music2, BookOpen, UserCog, Upload, Search, Palette, Star, MessageSquare, RefreshCw, Clock, LayoutGrid, Lightbulb, ListChecks, BrainCircuit, ShieldCheck, Waves, Radio } from 'lucide-react';
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
      <div className="text-center mb-12 md:mb-16">
        <h2 className={cn(
            "text-3xl md:text-5xl font-bold mb-4 tracking-tighter",
            isPyriteMode ? "text-purple-100 glitch-text" : "text-white"
        )} data-text={tGuide.title}>
            {tGuide.title}
        </h2>
        <p className="text-sm md:text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
            {tGuide.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        <div className="lg:col-span-1">
            <GuideNavigation t={tGuide} isPyriteMode={isPyriteMode} />
            
            {/* Pro Tip Sidebar */}
            <div className={cn(
                "mt-6 p-5 rounded-2xl border hidden lg:block",
                isPyriteMode ? "bg-purple-900/10 border-purple-500/20" : "bg-black/20 border-white/5"
            )}>
                <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isPyriteMode ? "text-purple-400" : "text-yellow-500")}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Obsidian Pro Tip
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "Darling, Suno V4.5 consumes the first 50 characters of a prompt with 80% weight. Always front-load your primary genre and key mood. Don't bury the lead."
                </p>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
            
            {/* SECTION: DEEP REASONING PROTOCOL */}
            <GuideSection id="start" title="The Obsidian Blueprint: Deep Reasoning" icon={BrainCircuit}>
                <div className="space-y-8">
                    <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                        Sonic Forge V5 isn't a random word generator. When you click <span className="font-bold text-white">INITIATE SEQUENCE</span>, the system engages a multi-step Agentic Cascade.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "I. Intent Extraction", desc: "My Reasoning Core analyzes your abstract concept to identify narrative arcs and emotional subtext.", icon: Search, color: "text-blue-400" },
                            { title: "II. Sonic Research", desc: "The Researcher Agent scours historical audio engineering data to match your artist references.", icon: Globe, color: "text-green-400" },
                            { title: "III. Technical Blueprinting", desc: "The Artist Agent blueprints a prompt using strict decoupling rules (Story vs Style).", icon: Palette, color: "text-purple-400" },
                            { title: "IV. The Inquisitor Pass", desc: "Every prompt is checked by a Critic Agent for character limits and v4.5 syntax violations.", icon: ShieldCheck, color: "text-red-400" }
                        ].map((step, i) => (
                            <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex gap-4">
                                <step.icon className={cn("w-6 h-6 shrink-0 mt-1", step.color)} />
                                <div>
                                    <h5 className="font-bold text-white text-sm mb-1">{step.title}</h5>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: GOLDEN RULES */}
            <GuideSection id="goldenRules" title={tGuide.goldenRules.title} icon={ListChecks}>
                <p className="text-sm text-zinc-400 mb-6">{tGuide.goldenRules.desc}</p>
                <div className="grid gap-4">
                    {tGuide.goldenRules.rules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 group hover:border-yellow-500/30 transition-all">
                            <div className={`p-2 rounded-lg shrink-0 ${isPyriteMode ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                <Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">{rule.title}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GuideSection>

            {/* SECTION: ADVANCED V4.5+ SECRETS */}
            <GuideSection id="v45plus" title="Suno V4.5+ Master Protocols" icon={Zap}>
                <div className="space-y-6">
                    <div className={cn("p-6 rounded-2xl border relative overflow-hidden", isPyriteMode ? "bg-purple-900/5 border-purple-500/20" : "bg-zinc-900/50 border-white/5")}>
                        <div className="flex items-center gap-3 mb-4">
                             <Waves className="w-5 h-5 text-blue-400" />
                             <h4 className="font-bold text-white uppercase tracking-widest text-xs">The Power Ending Formula</h4>
                        </div>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                            To prevent the infamous "Abrupt Cutoff" hallucination in v4.5, my engine automatically terminates lyrics with this exact sequence. Feel free to copy it manually for your own experiments:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <TagButton>[Outro]</TagButton>
                            <TagButton>[Instrumental Fade Out]</TagButton>
                            <TagButton>[End]</TagButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {[
                            { icon: Mic2, title: "Microtonal Expression", desc: "Use 'Microtonal pitch variations' in Style to get those haunting, slightly off-pitch vocal runs found in ethnic and experimental music." },
                            { icon: Music2, title: "The Pipe | Modifier Hack", desc: "V4.5 understands instructions inside section tags. Use '[Chorus | Anthemic, High-octane]' to force a shift in production energy." },
                            { icon: MessageSquare, title: "Lyrical Synesthesia", desc: "Don't just write lyrics. Tell Suno HOW to sing them using parenthetical ad-libs: 'E la cha-cha-cha (cha) (whispered: don't look back)'." },
                            { icon: Radio, title: "The Phonk Drum Fix", desc: "If your Hip-Hop beats sound like generic rock drums, add 'Phonk Drum' to your style. It forces 808-style saturation and snapping snares." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/[0.03] transition-colors">
                               <div className="flex items-center gap-2 mb-2">
                                   <item.icon className="w-4 h-4 text-yellow-500" />
                                   <h5 className="font-bold text-white uppercase tracking-tight">{item.title}</h5>
                               </div>
                               <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </GuideSection>

            {/* SECTION: TAG DICTIONARY */}
            <GuideSection id="tags" title={tGuide.tags.title} icon={Tag}>
                <p className="text-sm text-zinc-500 mb-6">{tGuide.tags.desc}</p>
                <div className="space-y-8">
                    {Object.entries(tGuide.tags.categories).map(([key, category]: [string, any]) => (
                        <div key={key} className="animate-in fade-in slide-in-from-left-4">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 border-l-2 border-white/10 pl-3">
                                {category.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {category.items.map((tag: string) => (
                                    <TagButton key={tag}>{tag}</TagButton>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </GuideSection>

            {/* SECTION: TROUBLESHOOTING */}
            <GuideSection id="troubleshooting" title={tGuide.troubleshooting.title} icon={Wrench}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {[
                        { title: tGuide.troubleshooting.abruptEnding, desc: tGuide.troubleshooting.abruptEndingDesc },
                        { title: tGuide.troubleshooting.wrongInstrument, desc: tGuide.troubleshooting.wrongInstrumentDesc },
                        { title: tGuide.troubleshooting.roboticVocals, desc: tGuide.troubleshooting.roboticVocalsDesc },
                        { title: tGuide.troubleshooting.audioDegradation, desc: tGuide.troubleshooting.audioDegradationDesc },
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-red-950/5 border border-red-500/10 hover:border-red-500/30 transition-all">
                           <h5 className="font-bold text-red-100 mb-2 flex items-center gap-2">
                               <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                               {item.title}
                           </h5>
                           <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </GuideSection>
        </div>
      </div>
    </div>
  );
};

const Globe = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

export default ReferenceGuide;
