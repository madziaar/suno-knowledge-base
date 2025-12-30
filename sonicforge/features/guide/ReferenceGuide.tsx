
import React from 'react';
import { Tag, PlayCircle, Layers, Zap, CheckCircle, AlertTriangle, Copy, ArrowRight, Mic2, Wrench, Sparkles, Wand2, Music2, BookOpen, UserCog, Upload, Search, Palette, Star, MessageSquare, RefreshCw, Clock, LayoutGrid, Lightbulb, ListChecks } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import GuideSection from './components/GuideSection';
import GuideNavigation from './components/GuideNavigation';
import { cn } from '../../lib/utils';
import { sfx } from '../../lib/audio';

// Sub-component for interactive tags
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
    "font-mono px-2 py-1 rounded-md border transition-all cursor-pointer group relative inline-flex items-center gap-1.5 text-xs",
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
    <div className="max-w-7xl mx-auto pb-20">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{tGuide.title}</h2>
        <p className="text-sm md:text-base text-zinc-500 max-w-lg mx-auto">{tGuide.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="lg:col-span-1">
            <GuideNavigation t={tGuide} isPyriteMode={isPyriteMode} />
        </div>

        <div className="lg:col-span-3 space-y-8">
            
            {/* SECTION 1: GETTING STARTED */}
            <GuideSection id="start" title={tGuide.start.title} icon={PlayCircle}>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">1</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">{tGuide.start.step1}</h4>
                            <p className="text-sm text-zinc-400">{tGuide.start.step1Desc}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">2</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">{tGuide.start.step2}</h4>
                            <p className="text-sm text-zinc-400">{tGuide.start.step2Desc}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">3</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">{tGuide.start.step3}</h4>
                            <p className="text-sm text-zinc-400">{tGuide.start.step3Desc}</p>
                        </div>
                    </div>
                </div>
            </GuideSection>

            {/* SECTION 2: GOLDEN RULES (NEW) */}
            <GuideSection id="goldenRules" title={tGuide.goldenRules.title} icon={ListChecks}>
                <p className="text-sm text-zinc-500 mb-6">{tGuide.goldenRules.desc}</p>
                <div className="grid gap-4">
                    {tGuide.goldenRules.rules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <div className={`p-2 rounded-lg shrink-0 ${isPyriteMode ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">{rule.title}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GuideSection>

            {/* SECTION 3: ADVANCED TOOLS */}
            <GuideSection id="advanced" title={tGuide.advanced.title} icon={Layers}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-colors">
                        <h4 className="font-bold text-white mb-2 flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                            {tGuide.advanced.expertTitle}
                        </h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">{tGuide.advanced.expertDesc}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-colors">
                        <h4 className="font-bold text-white mb-2 flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-purple-500" />
                            {tGuide.advanced.mirrorTitle}
                        </h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">{tGuide.advanced.mirrorDesc}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-bold text-white mb-2 flex items-center">
                            <Wand2 className="w-4 h-4 mr-2 text-blue-500" />
                            Creative Boost & Prompt Importer
                        </h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Use the sparkle icon to enhance simple concepts into rich descriptions. The "Import" button allows you to deconstruct and remix existing Suno prompts.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-green-500/30 transition-colors">
                        <h4 className="font-bold text-white mb-2 flex items-center">
                            <Music2 className="w-4 h-4 mr-2 text-green-500" />
                            Lyrical Architect & Alchemy Lab
                        </h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            An intelligent lyrics editor with syntax highlighting, AI rewrite tools (flow, edgy, rhyme), vowel extension, and chord annotation via a piano keyboard.
                        </p>
                    </div>
                </div>
            </GuideSection>

            {/* SECTION 4: TAGS REFERENCE (UPDATED) */}
            <GuideSection id="tags" title={tGuide.tags.title} icon={Tag}>
                <p className="text-sm text-zinc-500 mb-6">{tGuide.tags.desc}</p>
                
                <div className="space-y-8">
                    {/* Iterate through categories */}
                    {Object.entries(tGuide.tags.categories).map(([key, category]: [string, any]) => (
                        <div key={key}>
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
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

                {/* V4.5 Special Section */}
                <div className="mt-8 p-4 rounded-xl border border-yellow-500/20 bg-yellow-900/10">
                    <h4 className="text-sm font-bold text-yellow-400 mb-4 flex items-center">
                        <Mic2 className="w-4 h-4 mr-2" />
                        Suno V4.5 Advanced Techniques
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider">Vowel Extension (Melodic Effect)</p>
                            <div className="flex flex-wrap gap-2">
                                <TagButton>goo-o-o-odbye</TagButton>
                                <TagButton>lo-o-o-ove</TagButton>
                                <TagButton>sta-a-a-ay</TagButton>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider">Chord Annotations</p>
                            <div className="flex flex-wrap gap-2">
                                <TagButton>(Am) The night is cold</TagButton>
                                <TagButton>(G) Under city lights</TagButton>
                            </div>
                        </div>
                    </div>
                </div>
            </GuideSection>

            {/* SECTION 5: TROUBLESHOOTING */}
            <GuideSection id="troubleshooting" title={tGuide.troubleshooting.title} icon={Wrench}>
                <p className="text-sm text-zinc-500 mb-4">{tGuide.troubleshooting.desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {[
                        { title: tGuide.troubleshooting.abruptEnding, desc: tGuide.troubleshooting.abruptEndingDesc },
                        { title: tGuide.troubleshooting.wrongInstrument, desc: tGuide.troubleshooting.wrongInstrumentDesc },
                        { title: tGuide.troubleshooting.wrongAccent, desc: tGuide.troubleshooting.wrongAccentDesc },
                        { title: tGuide.troubleshooting.roboticVocals, desc: tGuide.troubleshooting.roboticVocalsDesc },
                        { title: tGuide.troubleshooting.loopingLyrics, desc: tGuide.troubleshooting.loopingLyricsDesc },
                        { title: tGuide.troubleshooting.randomNoise, desc: tGuide.troubleshooting.randomNoiseDesc },
                    ].map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                           <h5 className="font-bold text-white mb-1">{item.title}</h5>
                           <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </GuideSection>
            
            {/* SECTION 6: V4.5+ Features */}
            <GuideSection id="v45plus" title={tGuide.v45plus.title} icon={Sparkles}>
                <p className="text-sm text-zinc-500 mb-4">{tGuide.v45plus.desc}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {[
                        { icon: Mic2, title: tGuide.v45plus.addVocals, desc: tGuide.v45plus.addVocalsDesc },
                        { icon: Music2, title: tGuide.v45plus.addInstrumentals, desc: tGuide.v45plus.addInstrumentalsDesc },
                        { icon: Wand2, title: tGuide.v45plus.remaster, desc: tGuide.v45plus.remasterDesc },
                        { icon: Search, title: tGuide.v45plus.inspire, desc: tGuide.v45plus.inspireDesc },
                        { icon: Palette, title: tGuide.v45plus.covers, desc: tGuide.v45plus.coversDesc },
                        { icon: MessageSquare, title: tGuide.v45plus.remiLyrics, desc: tGuide.v45plus.remiLyricsDesc },
                        { icon: RefreshCw, title: tGuide.v45plus.versionToggle, desc: tGuide.v45plus.versionToggleDesc },
                        { icon: Clock, title: tGuide.v45plus.longerSongs, desc: tGuide.v45plus.longerSongsDesc },
                        { icon: LayoutGrid, title: tGuide.v45plus.genreMashups, desc: tGuide.v45plus.genreMashupsDesc },
                        { icon: Star, title: tGuide.v45plus.vocalExpressions, desc: tGuide.v45plus.vocalExpressionsDesc },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                           <item.icon className="w-4 h-4 mt-1 text-yellow-500 flex-shrink-0" />
                           <div>
                               <h5 className="font-bold text-white mb-1">{item.title}</h5>
                               <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </GuideSection>
        </div>
      </div>
    </div>
  );
};

export default ReferenceGuide;
