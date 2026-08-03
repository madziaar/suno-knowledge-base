
import React, { memo } from 'react';
import { Zap, BookOpen, Clock, FileText, LayoutGrid, Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';
import { useUI } from '../../contexts/UIContext';
import { translations } from '../../translations';

const MobileDock: React.FC = () => {
  const { lang, isPyriteMode } = useSettings();
  const { activeTab, setActiveTab } = useUI();
  const t = translations[lang];

  return (
    <nav className={cn(
        "md:hidden fixed bottom-6 left-4 right-4 z-50 rounded-3xl border shadow-2xl transition-all duration-500 backdrop-blur-md pb-safe",
        isPyriteMode 
          ? 'border-purple-500/40 bg-black/80 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/20' 
          : 'border-white/10 bg-zinc-900/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5'
    )}>
      <div className="flex justify-around items-center h-16 px-2 relative overflow-hidden rounded-3xl" role="tablist">
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
                          "flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-90 transition-all duration-200 relative group min-w-[50px]",
                          isActive 
                            ? (isPyriteMode ? 'text-purple-300' : 'text-yellow-400') 
                            : 'text-zinc-500 hover:text-zinc-300'
                      )}
                      aria-label={`${t.nav.open} ${item.label}`}
                  >
                      {isActive && (
                          <>
                            <div className={cn(
                                "absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full blur-xl opacity-40 transition-all duration-500",
                                isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'
                            )} />
                            <div className={cn(
                                "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                isPyriteMode ? 'bg-purple-400' : 'bg-yellow-400'
                            )} />
                          </>
                      )}
                      
                      <item.icon className={cn("w-5 h-5 transition-transform duration-300 stroke-[1.5]", isActive ? 'scale-110 drop-shadow-md' : '')} />
                      <span className={cn("text-[8px] font-bold uppercase tracking-wider transition-opacity", isActive ? "opacity-100" : "opacity-0")}>{item.label}</span>
                  </button>
              );
          })}
      </div>
    </nav>
  );
};

export default memo(MobileDock);
