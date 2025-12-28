
import React, { memo } from 'react';
import { Zap, BookOpen, Clock, FileText, LayoutGrid, Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettingsState } from '../../contexts/SettingsContext';
import { useUIState, useUIDispatch } from '../../contexts/UIContext';
import { translations } from '../../translations';

const MobileDock: React.FC = memo(() => {
  const { lang, isPyriteMode, performanceMode } = useSettingsState();
  const { activeTab } = useUIState();
  const { setActiveTab } = useUIDispatch();
  const t = translations[lang];

  const isLowPerf = performanceMode === 'low';

  return (
    <nav className={cn(
        "md:hidden fixed bottom-6 left-4 right-4 z-[50] rounded-3xl border shadow-2xl transition-all duration-500 pb-safe overflow-hidden",
        isLowPerf ? "bg-zinc-950 opacity-95" : "backdrop-blur-md",
        isPyriteMode 
          ? (isLowPerf ? 'border-purple-500/50' : 'border-purple-500/40 bg-black/80 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/20')
          : (isLowPerf ? 'border-zinc-700' : 'border-white/10 bg-zinc-900/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5')
    )}>
      <div className="flex justify-around items-center h-16 px-1 relative" role="tablist">
          {[
              { id: 'forge', icon: Zap, label: t.nav.forge },
              { id: 'studio', icon: Sliders, label: t.nav.studio },
              { id: 'templates', icon: LayoutGrid, label: t.nav.templates },
              { id: 'guide', icon: BookOpen, label: t.nav.guide },
              { id: 'history', icon: Clock, label: t.nav.history },
              { id: 'docs', icon: FileText, label: t.nav.docs }
          ].map(item => {
              const isActive = activeTab === item.id;
              return (
                  <button
                      key={item.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(item.id as any)}
                      className={cn(
                          "flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-95 transition-all duration-200 relative min-w-[45px]",
                          isActive 
                            ? (isPyriteMode ? 'text-purple-300' : 'text-yellow-400') 
                            : 'text-zinc-500'
                      )}
                      aria-label={`${t.nav.open} ${item.label}`}
                  >
                      {isActive && !isLowPerf && (
                          <div className={cn(
                              "absolute inset-0 rounded-2xl opacity-10 transition-all duration-500",
                              isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'
                          )} />
                      )}
                      
                      <item.icon className={cn("w-5 h-5 transition-transform duration-300 stroke-[2]", isActive ? 'scale-110 drop-shadow-md' : 'opacity-70')} />
                      <span className={cn("text-[8px] font-bold uppercase tracking-tight transition-opacity", isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>
                        {item.label}
                      </span>
                  </button>
              );
          })}
      </div>
    </nav>
  );
});

export default MobileDock;
