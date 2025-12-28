
import React, { memo, useCallback } from 'react';
import { Ghost, Zap, BookOpen, Clock, Volume2, VolumeX, FileText, LayoutGrid, Settings, Sliders } from 'lucide-react';
import Logo from '../shared/Logo';
import { useAudio } from '../../contexts/AudioContext';
import { triggerHaptic } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { useSettingsState, useSettingsDispatch, useUIState, useUIDispatch } from '../../contexts';
import { translations } from '../../translations';
import { Language } from '../../types';
import { motion, LayoutGroup } from 'framer-motion';

const Navbar: React.FC = memo(() => {
  const { lang, isOverclockedMode } = useSettingsState();
  const { setLang, setIsOverclockedMode } = useSettingsDispatch();
  const { activeTab } = useUIState();
  const { setActiveTab, openSettings } = useUIDispatch();
  const { isMuted, toggleMute, play } = useAudio();
  
  const t = translations[lang];

  const handleToggleMute = useCallback(() => {
      toggleMute();
      triggerHaptic('light');
  }, [toggleMute]);

  const handleCycleLang = useCallback(() => {
      const langs: Language[] = ['en', 'pl'];
      const currentIndex = langs.indexOf(lang);
      const nextIndex = (currentIndex + 1) % langs.length;
      setLang(langs[nextIndex]);
      play('click');
  }, [lang, setLang, play]);

  const handleOpenSettings = useCallback(() => {
      openSettings();
      play('click');
  }, [openSettings, play]);

  const NAV_ITEMS = [
    { id: 'forge', icon: Zap, label: t.nav.forge },
    { id: 'studio', icon: Sliders, label: t.nav.studio },
    { id: 'templates', icon: LayoutGrid, label: t.nav.templates },
    { id: 'guide', icon: BookOpen, label: t.nav.guide },
    { id: 'history', icon: Clock, label: t.nav.history },
    { id: 'docs', icon: FileText, label: t.nav.docs }
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-[72px] pt-safe backdrop-blur-xl border-b",
      isOverclockedMode 
        ? 'border-purple-500/10 bg-black/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
        : 'border-white/5 bg-zinc-950/80 shadow-2xl'
    )}>
      <div className="px-6 h-full flex items-center justify-between max-w-7xl mx-auto">
        
        <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 group cursor-default select-none">
              <div className={cn(
                "p-2.5 rounded-xl border transition-all duration-500 bg-white/5",
                isOverclockedMode 
                  ? 'border-purple-500/20 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                  : 'border-white/10 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]'
              )}>
                <Logo className={cn("w-5 h-5", isOverclockedMode ? 'drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' : '')} isPyriteMode={isOverclockedMode} />
              </div>
              <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-bold tracking-tight bg-clip-text text-transparent uppercase leading-none mb-1",
                    isOverclockedMode 
                      ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 animate-pulse' 
                      : 'bg-gradient-to-r from-yellow-200 to-yellow-600'
                  )}>
                    {t.nav.title.split(" V")[0]}
                  </span>
                  <span className={cn(
                    "text-[9px] tracking-[0.3em] font-mono opacity-60",
                    isOverclockedMode ? 'text-purple-400' : 'text-zinc-400'
                  )}>{t.nav.version}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <LayoutGroup>
                <div className={cn(
                  "flex space-x-1 p-1.5 rounded-xl border",
                  isOverclockedMode ? 'bg-zinc-900/60 border-purple-500/10' : 'bg-black/40 border-white/5'
                )} role="tablist">
                  {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button 
                        key={item.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(item.id as any)} 
                        className={cn(
                          "relative px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                          isActive 
                            ? (isOverclockedMode ? "text-purple-100" : "text-yellow-100") 
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                        aria-label={`${t.nav.switchTo} ${item.label}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill"
                            className={cn(
                              "absolute inset-0 rounded-lg shadow-sm",
                              isOverclockedMode ? 'bg-purple-600/30' : 'bg-white/10'
                            )}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <item.icon className={cn("w-3.5 h-3.5", isActive && (isOverclockedMode ? 'text-purple-300' : 'text-yellow-400'))} /> 
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </LayoutGroup>
              
              <div className="h-6 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                  <NavBarButton onClick={handleToggleMute} active={isMuted} activeColor="text-red-400" label={isMuted ? t.nav.unmute : t.nav.mute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </NavBarButton>

                  <button
                    onClick={handleCycleLang}
                    className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all text-[10px] font-mono font-bold border border-transparent hover:border-white/10 active:scale-95"
                    aria-label={t.nav.switchLang}
                  >
                    {lang.toUpperCase()}
                  </button>

                  <NavBarButton onClick={handleOpenSettings} label={t.nav.settings}>
                    <Settings className="w-4 h-4" />
                  </NavBarButton>
              </div>
            </div>
        </div>

        <div className="md:hidden flex items-center justify-between w-full h-full">
            <div className="flex items-center space-x-3 select-none">
                <div className={cn(
                    "p-2 rounded-xl border",
                    isOverclockedMode ? 'border-purple-500/30 bg-purple-500/10' : 'border-yellow-500/20 bg-yellow-500/10'
                )}>
                    <Logo className={cn("w-5 h-5", isOverclockedMode ? 'text-purple-500' : 'text-yellow-500')} isPyriteMode={isOverclockedMode} />
                </div>
                <span className={cn(
                    "font-bold text-lg tracking-tight",
                    isOverclockedMode ? 'text-purple-100 glitch-text' : 'text-zinc-100'
                )} data-text={isOverclockedMode ? 'OVERCLOCKED' : 'FORGE'}>
                    {isOverclockedMode ? 'OVERCLOCKED' : 'FORGE'}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenSettings}
                  className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 bg-zinc-900/50 active:scale-90 transition-transform"
                >
                  <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </header>
  );
});

const NavBarButton: React.FC<{ onClick: () => void, children: React.ReactNode, active?: boolean, activeColor?: string, label: string }> = ({ onClick, children, active, activeColor, label }) => (
    <button
        onClick={onClick}
        className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative group overflow-hidden active:scale-95",
        active && activeColor ? activeColor : 'text-zinc-400 hover:text-white hover:bg-white/10'
        )}
        title={label}
    >
        <div className="relative z-10">{children}</div>
    </button>
);

export default Navbar;
