
import React, { memo } from 'react';
import { PlayCircle, Layers, Tag, AudioWaveform, Wrench } from 'lucide-react';
import GlassPanel from '../../../components/shared/GlassPanel';
import { cn } from '../../../lib/utils';

interface GuideNavigationProps {
  t: any; // Using any to accept the Guide translation object directly
  isPyriteMode?: boolean;
}

const GuideNavigation: React.FC<GuideNavigationProps> = memo(({ t, isPyriteMode }) => {
  // Safety check: If translation object is missing, don't render to avoid crashes
  if (!t || !t.menu) {
    return null;
  }
  
  const LINKS = [
    { id: 'start', label: t.menu.start, icon: PlayCircle },
    { id: 'advanced', label: t.menu.advanced, icon: Layers },
    { id: 'riffusion', label: t.menu.riffusion, icon: AudioWaveform },
    { id: 'tags', label: t.menu.tags, icon: Tag },
    { id: 'troubleshooting', label: t.menu.troubleshooting, icon: Wrench },
  ];

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="sticky top-24 p-3 md:p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2 hidden md:block">
        Navigation
      </h3>
      
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => handleScroll(link.id)}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border border-transparent",
              "text-zinc-400 hover:text-white hover:bg-white/5",
              "focus:outline-none focus:border-white/10"
            )}
          >
            <link.icon className={cn("w-4 h-4 mr-2.5 opacity-70", isPyriteMode ? 'text-purple-400' : 'text-yellow-500')} />
            {link.label}
          </button>
        ))}
      </div>
    </GlassPanel>
  );
});

export default GuideNavigation;